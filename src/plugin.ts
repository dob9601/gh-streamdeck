import streamDeck from "@elgato/streamdeck";

import { GithubMonitor } from "./actions/monitor";
import _, { last } from "lodash";
import { ToggleFilter } from "./actions/toggle-filter";

export enum FilterState {
    ShowAll,
    ShowIssues,
    ShowCodeReviews,
}

export type GitHubTrackerGlobalSettings = {
    accessToken: string;
    wrapText: boolean;
    filterState: FilterState;
};

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel("debug");

const monitor = new GithubMonitor();
// Register the increment action.
streamDeck.actions.registerAction(monitor);
streamDeck.actions.registerAction(new ToggleFilter());

let lastGlobalSettings: GitHubTrackerGlobalSettings | null = null;
streamDeck.settings.onDidReceiveGlobalSettings<GitHubTrackerGlobalSettings>(
    async (event) => {
        if (!_.isEqual(lastGlobalSettings, event.settings)) {
            streamDeck.logger.info("Received updated global settings");

            monitor.refreshGithubClient(event.settings.accessToken);
            monitor.triggerApiPolling();
            lastGlobalSettings = event.settings;
        }
    },
);

// Finally, connect to the Stream Deck.
streamDeck.connect();
