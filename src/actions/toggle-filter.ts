import streamDeck, {
    action,
    KeyAction,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import { GitHubTrackerGlobalSettings } from "../plugin";
import {
    ExtendedOcticonRenderOptions,
    renderFilterIcon,
    renderIssueIcon,
    renderPullRequestIcon,
    renderReviewRequestedIcon,
} from "../octicons";
import { DataStore } from "../data-store";

export enum FilterState {
    ShowAll,
    ShowPullRequests,
    ShowIssues,
    ShowCodeReviews,
}

const TOGGLE_FILTER_UUID = "com.dob9601.gh-streamdeck.toggle-filter";

@action({ UUID: TOGGLE_FILTER_UUID })
export class ToggleFilter extends SingletonAction {
    private dataStore: DataStore;

    constructor(dataStore: DataStore) {
        super();
        this.dataStore = dataStore;
    }

    override async onWillAppear(
        ev: WillAppearEvent<GitHubTrackerGlobalSettings>,
    ): Promise<void> {
        await this.renderState();
    }

    override async onKeyDown(
        ev: KeyDownEvent<GitHubTrackerGlobalSettings>,
    ): Promise<void> {
        const globalSettings =
            await streamDeck.settings.getGlobalSettings<GitHubTrackerGlobalSettings>();

        const state = globalSettings.filterState ?? FilterState.ShowAll;
        const nextStateIndex = (state + 1) % 4;

        await streamDeck.settings.setGlobalSettings<GitHubTrackerGlobalSettings>(
            {
                ...globalSettings,
                filterState: nextStateIndex,
                offset: 0,
            },
        );

        await this.renderState();
        await this.dataStore.triggerRerender();
    }

    async renderState() {
        const actions = this.getActions();

        const globalSettings =
            await streamDeck.settings.getGlobalSettings<GitHubTrackerGlobalSettings>();

        const currentValue = globalSettings.filterState;

        let icon: string = "";
        let text: string = "";
        const renderOptions: ExtendedOcticonRenderOptions = {
            border: 15,
            color: "white",
            yOffset: -7,
        };

        if (currentValue === FilterState.ShowAll) {
            icon = renderFilterIcon(renderOptions);
            text = "All";
        } else if (currentValue == FilterState.ShowPullRequests) {
            icon = renderPullRequestIcon(renderOptions);
            text = "Pull\nRequests";
        } else if (currentValue == FilterState.ShowIssues) {
            icon = renderIssueIcon(renderOptions);
            text = "Assigned\nIssues";
        } else if (currentValue === FilterState.ShowCodeReviews) {
            icon = renderReviewRequestedIcon(renderOptions);
            text = "Requested\nReviews";
        }

        for (const action of actions) {
            await action.setImage(icon);
            await action.setTitle(text);
        }
    }

    getActions(): KeyAction[] {
        return [
            ...streamDeck.actions.filter(
                (action) => action.manifestId == TOGGLE_FILTER_UUID,
            ),
        ] as KeyAction[];
    }
}
