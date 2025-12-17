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

const PR_AUTHORED_QUERY = "is:pr is:open author:{USERNAME}";
const PR_REVIEW_REQUESTED_QUERY = "is:pr is:open review-requested:{USERNAME}";
const ISSUE_ASSIGNED_QUERY = "is:issue is:open assignee:{USERNAME}";

@action({ UUID: "com.dob9601.gh-streamdeck.monitor" })
export class GithubMonitor extends SingletonAction<GitHubTrackerSettings> {
    private intervalId: NodeJS.Timeout | null = null;
    private githubClient: Octokit | null = null;
    private urlMapping: Record<string, string> = {};
    private username: string | null = null;

    override async onWillAppear(
        ev: WillAppearEvent<GitHubTrackerSettings>,
    ): Promise<void> {
        const settings =
            await streamDeck.settings.getGlobalSettings<GitHubTrackerSettings>();
        this.githubClient = new Octokit({
            auth: settings.accessToken,
        });
        this.username = (
            await this.githubClient.rest.users.getAuthenticated()
        ).data.login;

        if (!this.intervalId) {
            this.startApiPolling();
        }
    }

    startApiPolling() {
        this.intervalId = setInterval(this.updateActions, 15000);
        this.updateActions();
    }

    async updateActions() {
        if (!this.username) {
            return;
        }

        const issuesAndPullRequests =
            this.githubClient?.rest.search.issuesAndPullRequests;

        streamDeck.logger.info(
            "Fetching pull requests, issues, and requested reviews...",
        );
        const [
            authoredPullRequestsResponse,
            assignedIssuesResponse,
            reviewsRequestedResponse,
        ] = await Promise.all([
            issuesAndPullRequests?.({
                q: PR_AUTHORED_QUERY.replaceAll("{USERNAME}", this.username),
                per_page: streamDeck.actions.length,
                sort: "updated",
            }),
            issuesAndPullRequests?.({
                q: ISSUE_ASSIGNED_QUERY.replaceAll("{USERNAME}", this.username),
                per_page: streamDeck.actions.length,
                sort: "updated",
            }),
            issuesAndPullRequests?.({
                q: PR_REVIEW_REQUESTED_QUERY.replaceAll(
                    "{USERNAME}",
                    this.username,
                ),
                per_page: streamDeck.actions.length,
                sort: "updated",
            }),
        ]);

        const data = {
            authoredPullRequests:
                authoredPullRequestsResponse?.data.items ?? [],
            assignedIssues: assignedIssuesResponse?.data.items ?? [],
            reviewsRequested: reviewsRequestedResponse?.data.items ?? [],
        };

        let index = 0;
        const actions = [...streamDeck.actions].sort((a, b) => {
            const aRow = a.coordinates?.row ?? 0;
            const bRow = b.coordinates?.row ?? 0;
            if (aRow !== bRow) {
                return aRow - bRow;
            }

            const aCol = a.coordinates?.column ?? 0;
            const bCol = b.coordinates?.column ?? 0;
            return aCol - bCol;
        });

        this.urlMapping = {};

        streamDeck.logger.info("Rendering icons and updating keys...");
        outer: for (const [dataType, items] of Object.entries(data)) {
            let icon;
            if (dataType === "authoredPullRequests") {
                icon = renderPullRequestIcon({ border: 15, yOffset: -10 });
            } else if (dataType === "assignedIssues") {
                icon = renderIssueIcon({ border: 15, yOffset: -10 });
            } else if (dataType === "reviewsRequested") {
                icon = renderReviewRequestedIcon({
                    border: 15,
                    yOffset: -10,
                });
            }

            for (const item of items) {
                const action = actions[index] as KeyAction;
                if (!action) {
                    break outer;
                }

                await action.setImage(icon);
                const repoName = item.repository_url
                    .split("/")
                    .slice(-1)
                    .join("/");

                await action.setTitle(`${repoName}\n#${item.number}`);

                this.urlMapping[action.id] = item.html_url;

                index += 1;
            }
        }
        for (const remainingAction of actions.slice(index)) {
            streamDeck.logger.warn(index);
            await remainingAction.setImage(renderGithubIcon({ border: 15 }));
            await remainingAction.setTitle("");
        }
    }
    override async onKeyDown(
        ev: KeyDownEvent<GitHubTrackerSettings>,
    ): Promise<void> {
        streamDeck.logger.info("Key down received!");
        const url = this.urlMapping[ev.action.id];
        if (url) {
            await streamDeck.system.openUrl(url);
        }
    }
}

type GitHubTrackerSettings = {
    accessToken: string;
};
