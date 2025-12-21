import streamDeck from "@elgato/streamdeck";
import { Octokit } from "octokit";
import { GitHubTrackerGlobalSettings } from "./plugin";

const PR_AUTHORED_QUERY = "is:pr is:open author:{USERNAME}";
const PR_REVIEW_REQUESTED_QUERY = "is:pr is:open review-requested:{USERNAME}";
const ISSUE_ASSIGNED_QUERY = "is:issue is:open assignee:{USERNAME}";
const FETCH_FREQUENCY_MS = 15_000;

export type IssueOrPullRequest = Awaited<
    ReturnType<Octokit["rest"]["search"]["issuesAndPullRequests"]>
>["data"]["items"]["0"];

export interface UserData {
    assignedIssues: IssueOrPullRequest[];
    authoredPullRequests: IssueOrPullRequest[];
    requestedReviews: IssueOrPullRequest[];
}

export enum FilterState {
    ShowAll,
    ShowPullRequests,
    ShowIssues,
    ShowCodeReviews,
}
type Callback = (data: UserData) => void | Promise<void>;

export class DataStore {
    private intervalId: NodeJS.Timeout | null = null;
    private githubClient: Octokit | null = null;
    private callbacks: Callback[] = [];

    private data: UserData = {
        assignedIssues: [],
        authoredPullRequests: [],
        requestedReviews: [],
    };

    private username: string | null = null;
    private globalSettings: GitHubTrackerGlobalSettings | null = null;

    constructor() {
        streamDeck.logger.info("Starting api polling...");

        this.intervalId = setInterval(async () => {
            await this.fetchData();
        }, FETCH_FREQUENCY_MS);
        this.fetchData();
    }

    addRenderCallback(callback: Callback) {
        this.callbacks.push(callback);
    }

    getData(filter?: FilterState): UserData {
        if (filter === undefined || filter === FilterState.ShowAll) {
            return this.data;
        }

        const filteredData: UserData = {
            assignedIssues: [],
            authoredPullRequests: [],
            requestedReviews: [],
        };

        if (filter === FilterState.ShowIssues) {
            filteredData.assignedIssues = this.data.assignedIssues;
        } else if (filter === FilterState.ShowCodeReviews) {
            filteredData.requestedReviews = this.data.requestedReviews;
        } else if (filter === FilterState.ShowPullRequests) {
            filteredData.authoredPullRequests = this.data.authoredPullRequests;
        }

        return filteredData;
    }

    getDataLength(filter?: FilterState): number {
        const data = this.getData(filter);
        return (Object.values(data) as unknown[][]).flat(1).length;
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

        await this.triggerRerender();
    }

    async triggerRerender() {
        for (const callback of this.callbacks) {
            await callback(this.data);
        }
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

    refreshGithubClient(token: string) {
        this.githubClient = new Octokit({
            auth: token,
        });
    }
}
