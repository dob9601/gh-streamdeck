import streamDeck, {
    action,
    KeyAction,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import { Octokit } from "octokit";
import {
    renderGithubIcon,
    renderIssueIcon,
    renderPullRequestIcon,
    renderReviewRequestedIcon,
} from "../octicons";
import { GitHubTrackerGlobalSettings } from "../plugin";
import _ from "lodash";

const PR_AUTHORED_QUERY = "is:pr is:open author:{USERNAME}";
const PR_REVIEW_REQUESTED_QUERY = "is:pr is:open review-requested:{USERNAME}";
const ISSUE_ASSIGNED_QUERY = "is:issue is:open assignee:{USERNAME}";
const FETCH_FREQUENCY_MS = 15_000;

interface UserData {
    assignedIssues: IssueOrPullRequest[];
    authoredPullRequests: IssueOrPullRequest[];
    requestedReviews: IssueOrPullRequest[];
}

type IssueOrPullRequest = Awaited<
    ReturnType<Octokit["rest"]["search"]["issuesAndPullRequests"]>
>["data"]["items"]["0"];

const MONITOR_UUID = "com.dob9601.gh-streamdeck.monitor";

@action({ UUID: MONITOR_UUID })
export class GithubMonitor extends SingletonAction<GitHubTrackerGlobalSettings> {
    private intervalId: NodeJS.Timeout | null = null;
    private githubClient: Octokit | null = null;
    private urlMapping: Record<string, string> = {};
    private username: string | null = null;
    private globalSettings: GitHubTrackerGlobalSettings | null = null;
    private data: UserData | null = null;

    private renderActionsThrottled = _.throttle(
        async () => await this.renderActions(),
        200,
    );

    override async onWillAppear(
        _ev: WillAppearEvent<GitHubTrackerGlobalSettings>,
    ): Promise<void> {
        if (!this.intervalId) {
            this.triggerApiPolling();
        } else {
            this.renderActionsThrottled();
        }
    }

    triggerApiPolling() {
        if (this.intervalId) {
            return;
        }

        streamDeck.logger.info("Starting api polling...");

        this.intervalId = setInterval(async () => {
            await this.fetchData();
        }, FETCH_FREQUENCY_MS);
        this.fetchData();
    }

    async fetchData() {
        if (this.globalSettings === null) {
            this.globalSettings =
                await streamDeck.settings.getGlobalSettings<GitHubTrackerGlobalSettings>();
        }

        if (this.githubClient === null) {
            this.refreshGithubClient(this.globalSettings.accessToken);
        }

        if (!this.username) {
            this.username = (
                await this.githubClient!.rest.users.getAuthenticated()
            ).data.login;
        }

        streamDeck.logger.info(
            "Fetching pull requests, issues, and requested reviews...",
        );
        const [
            authoredPullRequestsResponse,
            assignedIssuesResponse,
            reviewsRequestedResponse,
        ] = await Promise.all([
            this.fetchAuthoredPullRequests(),
            this.fetchAssignedIssues(),
            this.fetchReviewsRequested(),
        ]);

        this.data = {
            authoredPullRequests: authoredPullRequestsResponse,
            assignedIssues: assignedIssuesResponse,
            requestedReviews: reviewsRequestedResponse,
        };

        streamDeck.logger.info(
            `Successfully fetched ${authoredPullRequestsResponse.length} authored pull requests, ${assignedIssuesResponse.length} assigned issues, and ${reviewsRequestedResponse.length} requested reviews`,
        );

        this.renderActions();
    }

    async renderActions() {
        streamDeck.logger.info("Rerendering data...");
        const settings =
            await streamDeck.settings.getGlobalSettings<GitHubTrackerGlobalSettings>();

        const actions = GithubMonitor.sortedActions();
        let index = 0;

        this.urlMapping = {};

        if (!this.data) {
            return;
        }

        streamDeck.logger.info("Rendering icons and updating keys...");

        outer: for (const dataType of Object.keys(this.data)) {
            const items = this.data[dataType as keyof UserData];

            let icon;
            if (dataType === "authoredPullRequests") {
                icon = renderPullRequestIcon({ border: 13, yOffset: -7 });
            } else if (dataType === "assignedIssues") {
                icon = renderIssueIcon({ border: 13, yOffset: -7 });
            } else if (dataType === "requestedReviews") {
                icon = renderReviewRequestedIcon({
                    border: 13,
                    yOffset: -7,
                });
            }

            for (const item of items) {
                const action = actions[index] as KeyAction;
                if (!action) {
                    break outer;
                }

                await action.setImage(icon);
                let repoName = item.repository_url
                    .split("/")
                    .slice(-1)
                    .join("/");

                if (settings.wrapText) {
                    repoName = repoName.replace(/(.{11})/g, "$1\n").trimEnd();
                } else {
                    repoName = _.truncate(repoName, { length: 11 });
                }

                await action.setTitle(`${repoName}\n#${item.number}`);

                this.urlMapping[action.id] = item.html_url;

                index += 1;
            }
        }

        const remainingActions = actions.slice(index);
        if (remainingActions.length > 0) {
            streamDeck.logger.info(
                `Clearing ${remainingActions.length} remaining actions...`,
            );
        }

        for (const remainingAction of remainingActions) {
            await remainingAction.setImage(renderGithubIcon({ border: 15 }));
            await remainingAction.setTitle("");
        }

        streamDeck.logger.info("Successfully finished updating state");
    }

    private async fetchAuthoredPullRequests(): Promise<IssueOrPullRequest[]> {
        if (!this.githubClient || !this.username) return [];

        return (
            await this.githubClient.rest.search.issuesAndPullRequests({
                q: PR_AUTHORED_QUERY.replaceAll("{USERNAME}", this.username),
                sort: "updated",
            })
        ).data.items;
    }

    private async fetchAssignedIssues(): Promise<IssueOrPullRequest[]> {
        if (!this.githubClient || !this.username) return [];

        return (
            await this.githubClient.rest.search.issuesAndPullRequests({
                q: ISSUE_ASSIGNED_QUERY.replaceAll("{USERNAME}", this.username),
                sort: "updated",
            })
        ).data.items;
    }

    private async fetchReviewsRequested(): Promise<IssueOrPullRequest[]> {
        if (!this.githubClient || !this.username) return [];

        return (
            await this.githubClient.rest.search.issuesAndPullRequests({
                q: PR_REVIEW_REQUESTED_QUERY.replaceAll(
                    "{USERNAME}",
                    this.username,
                ),
                sort: "updated",
            })
        ).data.items;
    }

    static sortedActions(): KeyAction[] {
        return [...streamDeck.actions]
            .filter((action) => action.manifestId === MONITOR_UUID)
            .sort((a, b) => {
                const aRow = a.coordinates?.row ?? 0;
                const bRow = b.coordinates?.row ?? 0;
                if (aRow !== bRow) {
                    return aRow - bRow;
                }

                const aCol = a.coordinates?.column ?? 0;
                const bCol = b.coordinates?.column ?? 0;
                return aCol - bCol;
            }) as KeyAction[];
    }

    override async onKeyDown(
        ev: KeyDownEvent<GitHubTrackerGlobalSettings>,
    ): Promise<void> {
        streamDeck.logger.info("Key down received!");
        const url = this.urlMapping[ev.action.id];
        if (url) {
            await streamDeck.system.openUrl(url);
        }
    }

    refreshGithubClient(token: string) {
        this.githubClient = new Octokit({
            auth: token,
        });
    }
}
