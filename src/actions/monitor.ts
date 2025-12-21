import streamDeck, {
    action,
    KeyAction,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import {
    renderCircleSlashIcon,
    renderIssueIcon,
    renderPullRequestIcon,
    renderReviewRequestedIcon,
} from "../octicons";
import { GitHubTrackerGlobalSettings } from "../plugin";
import _ from "lodash";
import { FilterState } from "./toggle-filter";
import { DataStore, UserData } from "../data-store";

export const MONITOR_UUID = "com.dob9601.gh-streamdeck.monitor";

@action({ UUID: MONITOR_UUID })
export class GithubMonitor extends SingletonAction<GitHubTrackerGlobalSettings> {
    private urlMapping: Record<string, string> = {};

    private dataStore: DataStore;

    constructor(dataStore: DataStore) {
        super();
        this.dataStore = dataStore;
        this.dataStore.addRenderCallback(
            async () => await this.renderActions(),
        );
    }

    private renderActionsThrottled = _.throttle(
        async () => await this.renderActions(),
        200,
    );

    override async onWillAppear(
        _ev: WillAppearEvent<GitHubTrackerGlobalSettings>,
    ): Promise<void> {
        this.renderActionsThrottled();
    }

    async renderActions() {
        streamDeck.logger.info("Rendering actions...");
        const settings =
            await streamDeck.settings.getGlobalSettings<GitHubTrackerGlobalSettings>();

        const actions = GithubMonitor.sortedActions();
        let index = 0;

        this.urlMapping = {};

        let toSkip = settings.offset;

        const data = this.dataStore.getData(settings.filterState);
        outer: for (const dataType of Object.keys(data)) {
            const items = data[dataType as keyof UserData];

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
                if (toSkip > 0) {
                    toSkip -= 1;
                    continue;
                }

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
            await remainingAction.setImage(
                renderCircleSlashIcon({ border: 15 }),
            );
            await remainingAction.setTitle("");
        }

        streamDeck.logger.info("Successfully finished updating state");
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
}
