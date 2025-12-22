import streamDeck, { action } from "@elgato/streamdeck";
import { renderChevronLeftIcon } from "../../octicons";
import { OffsetActionBase } from "./base";
import { DataStore } from "../../data-store";
import { GitHubTrackerGlobalSettings } from "../../plugin";
import { GithubMonitor } from "../monitor";

const OFFSET_LEFT_UUID = "com.dob9601.gh-streamdeck.offset-left";

@action({ UUID: OFFSET_LEFT_UUID })
export class OffsetLeft extends OffsetActionBase {
    override actionUuid: string = OFFSET_LEFT_UUID;

    constructor(dataStore: DataStore) {
        super(dataStore);
    }

    override async renderIcon(): Promise<string> {
        const offset = await streamDeck.settings
            .getGlobalSettings<GitHubTrackerGlobalSettings>()
            .then((s) => s.offset);

        return renderChevronLeftIcon({
            border: 15,
            color: offset <= 0 ? "red" : "white",
        });
    }

    override updateOffset(offset: number): number {
        return Math.max(0, offset - GithubMonitor.pageSize());
    }
}
