import streamDeck, {
    action,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import { FilterState, GitHubTrackerGlobalSettings } from "../plugin";

@action({ UUID: "com.dob9601.gh-streamdeck.toggle-filter" })
export class ToggleFilter extends SingletonAction {
    override async onWillAppear(
        ev: WillAppearEvent<GitHubTrackerGlobalSettings>,
    ): Promise<void> {}

    async renderState() {
        const globalSettings =
            await streamDeck.settings.getGlobalSettings<GitHubTrackerGlobalSettings>();

        const currentValue = globalSettings.filterState;

        let icon;
        if (currentValue === FilterState.ShowAll) {
        } else if (currentValue === FilterState.ShowCodeReviews) {
        } else if (currentValue == FilterState.ShowIssues) {
        }
    }
}
