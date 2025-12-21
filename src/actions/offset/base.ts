import streamDeck, {
    KeyAction,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";
import { GitHubTrackerGlobalSettings } from "../../plugin";
import { DataStore } from "../../data-store";
import { MONITOR_UUID } from "../monitor";

export class OffsetActionBase extends SingletonAction {
    protected dataStore: DataStore;
    protected actionUuid: string = "";

    constructor(dataStore: DataStore) {
        super();
        this.dataStore = dataStore;
        dataStore.addRenderCallback(async () => {
            const globalSettings =
                await streamDeck.settings.getGlobalSettings<GitHubTrackerGlobalSettings>();
            await this.renderState(globalSettings.offset);
        });
    }

    override async onWillAppear(
        ev: WillAppearEvent<GitHubTrackerGlobalSettings>,
    ): Promise<void> {
        const globalSettings =
            await streamDeck.settings.getGlobalSettings<GitHubTrackerGlobalSettings>();

        await this.renderState(globalSettings.offset);
    }

    override async onKeyDown(
        ev: KeyDownEvent<GitHubTrackerGlobalSettings>,
    ): Promise<void> {
        let globalSettings =
            await streamDeck.settings.getGlobalSettings<GitHubTrackerGlobalSettings>();

        globalSettings.offset = await this.updateOffset(globalSettings.offset);
        streamDeck.logger.info(
            `Updating monitor offset to ${globalSettings.offset}`,
        );

        await streamDeck.settings.setGlobalSettings<GitHubTrackerGlobalSettings>(
            globalSettings,
        );

        await this.renderState(globalSettings.offset);

        await this.dataStore.triggerRerender();
    }

    async renderState(offset: number) {
        const actions = this.getActions();

        const icon = await this.renderIcon();

        for (const action of actions) {
            await action.setImage(icon);
        }
    }

    getActions(): KeyAction[] {
        return [
            ...streamDeck.actions.filter(
                (action) => action.manifestId === this.actionUuid,
            ),
        ] as KeyAction[];
    }

    updateOffset(offset: number): Promise<number> | number {
        throw new Error("Method not implemented");
    }

    protected monitorCount(): number {
        return streamDeck.actions.filter(
            (action) => action.manifestId === MONITOR_UUID,
        ).length;
    }

    async renderIcon(): Promise<string> {
        throw new Error("Method not implemented.");
    }
}
