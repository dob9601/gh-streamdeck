import streamDeck, { action } from "@elgato/streamdeck";
import { GitHubTrackerGlobalSettings } from "../../plugin";
import {
    ExtendedOcticonRenderOptions,
    renderChevronRightIcon,
} from "../../octicons";
import { OffsetActionBase } from "./base";
import { DataStore } from "../../data-store";
import { GithubMonitor } from "../monitor";

const OFFSET_RIGHT_UUID = "com.dob9601.gh-streamdeck.offset-right";

@action({ UUID: OFFSET_RIGHT_UUID })
export class OffsetRight extends OffsetActionBase {
    override actionUuid: string = OFFSET_RIGHT_UUID;

    constructor(dataStore: DataStore) {
        super(dataStore);
    }

    override async renderIcon(): Promise<string> {
        const offset = await streamDeck.settings
            .getGlobalSettings<GitHubTrackerGlobalSettings>()
            .then((s) => s.offset);

        return renderChevronRightIcon({
            border: 15,
            color: offset >= (await this.maxOffset()) ? "red" : "white",
        });
    }

    override async updateOffset(offset: number): Promise<number> {
        return Math.min(
            await this.maxOffset(),
            offset + GithubMonitor.pageSize(),
        );
    }

    private async itemCount(): Promise<number> {
        const filter = await streamDeck.settings
            .getGlobalSettings<GitHubTrackerGlobalSettings>()
            .then((s) => s.filterState);

        return this.dataStore.getDataLength(filter);
    }

    private async maxOffset(): Promise<number> {
        return Math.max((await this.itemCount()) - GithubMonitor.pageSize(), 0);
    }
}
