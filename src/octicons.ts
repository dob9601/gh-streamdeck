// Icons adapted from https://github.com/primer/octicons, licensed under the MIT license
//
// MIT License
//
// Copyright (c) 2025 GitHub Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import streamDeck from "@elgato/streamdeck";
import { readFileSync } from "fs";

// https://brand.github.com/foundations/color#primary-palette
const GITHUB_GREEN_4_HEX = "#08872B";

interface OcticonRenderOptions {
    color: string;
    viewBox: string;
}

export interface ExtendedOcticonRenderOptions extends Partial<OcticonRenderOptions> {
    border?: number;
    xOffset?: number;
    yOffset?: number;
}

function renderOcticon(octiconSvg: string, opts: OcticonRenderOptions): string {
    return (
        "data:image/svg+xml," +
        encodeURIComponent(
            octiconSvg
                .replace(/fill=".*"/, `fill="${opts.color}"`)
                .replace(/viewBox=".*"/, `viewBox="${opts.viewBox}"`),
        )
    );
}

const PULL_REQUEST_ICON = readFileSync(
    "./imgs/octicons/pull-request.svg",
).toString();

export function renderPullRequestIcon(
    opts?: ExtendedOcticonRenderOptions,
): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? GITHUB_GREEN_4_HEX,
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 24 24", opts),
    };
    return renderOcticon(PULL_REQUEST_ICON, prefilledOpts);
}

const GITHUB_ICON = readFileSync("./imgs/plugin/github.svg").toString();

export function renderGithubIcon(opts?: ExtendedOcticonRenderOptions): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? "white",
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 98 96", opts),
    };
    return renderOcticon(GITHUB_ICON, prefilledOpts);
}

const ISSUE_ICON = readFileSync("./imgs/octicons/issue.svg").toString();

export function renderIssueIcon(opts?: ExtendedOcticonRenderOptions): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? GITHUB_GREEN_4_HEX,
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 24 24", opts),
    };
    return renderOcticon(ISSUE_ICON, prefilledOpts);
}

const REVIEW_REQUESTED_ICON = readFileSync(
    "./imgs/octicons/code-review.svg",
).toString();

export function renderReviewRequestedIcon(
    opts?: ExtendedOcticonRenderOptions,
): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? GITHUB_GREEN_4_HEX,
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 24 24", opts),
    };
    return renderOcticon(REVIEW_REQUESTED_ICON, prefilledOpts);
}

const FILTER_ICON = readFileSync("./imgs/octicons/filter.svg").toString();

export function renderFilterIcon(opts?: ExtendedOcticonRenderOptions): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? "white",
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 24 24", opts),
    };
    return renderOcticon(FILTER_ICON, prefilledOpts);
}

const CIRCLE_SLASH_ICON = readFileSync(
    "./imgs/octicons/circle-slash.svg",
).toString();

export function renderCircleSlashIcon(
    opts?: ExtendedOcticonRenderOptions,
): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? "white",
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 24 24", opts),
    };
    return renderOcticon(CIRCLE_SLASH_ICON, prefilledOpts);
}

const CHEVRON_LEFT_ICON = readFileSync(
    "./imgs/octicons/chevron-left.svg",
).toString();

export function renderChevronLeftIcon(
    opts?: ExtendedOcticonRenderOptions,
): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? "white",
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 24 24", opts),
    };
    return renderOcticon(CHEVRON_LEFT_ICON, prefilledOpts);
}

const CHEVRON_RIGHT_ICON = readFileSync(
    "./imgs/octicons/chevron-right.svg",
).toString();

export function renderChevronRightIcon(
    opts?: ExtendedOcticonRenderOptions,
): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? "white",
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 24 24", opts),
    };
    return renderOcticon(CHEVRON_RIGHT_ICON, prefilledOpts);
}

function calculateViewbox(
    defaultViewbox: string,
    opts?: ExtendedOcticonRenderOptions,
): string {
    const { border, xOffset, yOffset } = opts ?? {};
    let [startingX, startingY, width, height] = defaultViewbox
        .split(" ")
        .map(Number);

    if (border) {
        startingX -= border;
        startingY -= border;
        width += border * 2;
        height += border * 2;
    }

    if (xOffset) {
        startingX -= xOffset;
    }

    if (yOffset) {
        startingY -= yOffset;
    }

    return `${startingX} ${startingY} ${width} ${height}`;
}
