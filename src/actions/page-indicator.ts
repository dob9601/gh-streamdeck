import streamDeck, {
    action,
    KeyAction,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import { GitHubTrackerGlobalSettings } from "../plugin";
import { DataStore } from "../data-store";
import { GithubMonitor } from "./monitor";

const PAGE_COUNTER_UUID = "com.dob9601.gh-streamdeck.page-indicator";

@action({ UUID: PAGE_COUNTER_UUID })
export class PageIndicator extends SingletonAction {
    private dataStore: DataStore;

    constructor(dataStore: DataStore) {
        super();
        this.dataStore = dataStore;
        this.dataStore.addRenderCallback(async () => {
            await this.renderState();
        });
    }

    override async onWillAppear(
        ev: WillAppearEvent<GitHubTrackerGlobalSettings>,
    ): Promise<void> {
        await this.renderState();
    }

    async renderState() {
        const offset = await streamDeck.settings
            .getGlobalSettings<GitHubTrackerGlobalSettings>()
            .then((s) => s.offset);

        const page = Math.floor(offset / GithubMonitor.pageSize()) + 1;

        for (const action of this.getActions()) {
            action.setTitle(Math.floor(page).toString());
        }
    }

    getActions(): KeyAction[] {
        return [
            ...streamDeck.actions.filter(
                (action) => action.manifestId === PAGE_COUNTER_UUID,
            ),
        ] as KeyAction[];
    }
}
