// https://brand.github.com/foundations/color#primary-palette
const GITHUB_GREEN_4_HEX = "#08872B";

interface OcticonRenderOptions {
    color: string;
    viewBox: string;
}

interface ExtendedOcticonRenderOptions extends Partial<OcticonRenderOptions> {
    border?: number;
    xOffset?: number;
    yOffset?: number;
}

function renderOcticon(octiconSvg: string, opts: OcticonRenderOptions): string {
    return (
        "data:image/svg+xml," +
        encodeURIComponent(
            octiconSvg
                .replace("{COLOR}", opts.color)
                .replace("{VIEW_BOX}", opts.viewBox),
        )
    );
}

const PULL_REQUEST_ICON = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="{VIEW_BOX}"
    width="24"
    height="24"
    fill="{COLOR}"
>
    <path
        d="M16 19.25a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0Zm-14.5 0a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0Zm0-14.5a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0ZM4.75 3a1.75 1.75 0 1 0 .001 3.501A1.75 1.75 0 0 0 4.75 3Zm0 14.5a1.75 1.75 0 1 0 .001 3.501A1.75 1.75 0 0 0 4.75 17.5Zm14.5 0a1.75 1.75 0 1 0 .001 3.501 1.75 1.75 0 0 0-.001-3.501Z"
    />
    <path
        d="M13.405 1.72a.75.75 0 0 1 0 1.06L12.185 4h4.065A3.75 3.75 0 0 1 20 7.75v8.75a.75.75 0 0 1-1.5 0V7.75a2.25 2.25 0 0 0-2.25-2.25h-4.064l1.22 1.22a.75.75 0 0 1-1.061 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 0ZM4.75 7.25A.75.75 0 0 1 5.5 8v8A.75.75 0 0 1 4 16V8a.75.75 0 0 1 .75-.75Z"
    />
</svg>
`;

export function renderPullRequestIcon(
    opts?: ExtendedOcticonRenderOptions,
): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? GITHUB_GREEN_4_HEX,
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 24 24", opts),
    };
    return renderOcticon(PULL_REQUEST_ICON, prefilledOpts);
}

const GITHUB_ICON = `
<svg
    width="98"
    height="96"
    viewBox="{VIEW_BOX}"
    xmlns="http://www.w3.org/2000/svg"
>
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
        fill="#fff"
    />
</svg>
`;

export function renderGithubIcon(opts?: ExtendedOcticonRenderOptions): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? "white",
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 98 96", opts),
    };
    return renderOcticon(GITHUB_ICON, prefilledOpts);
}

const ISSUE_ICON = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="{VIEW_BOX}"
    fill="{COLOR}"
    width="24"
    height="24"
>
    <path
        d="M12 1c6.075 0 11 4.925 11 11s-4.925 11-11 11S1 18.075 1 12 5.925 1 12 1ZM2.5 12a9.5 9.5 0 0 0 9.5 9.5 9.5 9.5 0 0 0 9.5-9.5A9.5 9.5 0 0 0 12 2.5 9.5 9.5 0 0 0 2.5 12Zm9.5 2a2 2 0 1 1-.001-3.999A2 2 0 0 1 12 14Z"
    />
</svg>
`;

export function renderIssueIcon(opts?: ExtendedOcticonRenderOptions): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? GITHUB_GREEN_4_HEX,
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 24 24", opts),
    };
    return renderOcticon(ISSUE_ICON, prefilledOpts);
}

const REVIEW_REQUESTED_ICON = `
<svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="{VIEW_BOX}"
    fill="{COLOR}"
    width="24"
    height="24"
>
    <path d="M10.3 6.74a.75.75 0 0 1-.04 1.06l-2.908 2.7 2.908 2.7a.75.75 0 1 1-1.02 1.1l-3.5-3.25a.75.75 0 0 1 0-1.1l3.5-3.25a.75.75 0 0 1 1.06.04Zm3.44 1.06a.75.75 0 1 1 1.02-1.1l3.5 3.25a.75.75 0 0 1 0 1.1l-3.5 3.25a.75.75 0 1 1-1.02-1.1l2.908-2.7-2.908-2.7Z"></path><path d="M1.5 4.25c0-.966.784-1.75 1.75-1.75h17.5c.966 0 1.75.784 1.75 1.75v12.5a1.75 1.75 0 0 1-1.75 1.75h-9.69l-3.573 3.573A1.458 1.458 0 0 1 5 21.043V18.5H3.25a1.75 1.75 0 0 1-1.75-1.75ZM3.25 4a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h2.5a.75.75 0 0 1 .75.75v3.19l3.72-3.72a.749.749 0 0 1 .53-.22h10a.25.25 0 0 0 .25-.25V4.25a.25.25 0 0 0-.25-.25Z">
    </path>
</svg>
`;

export function renderReviewRequestedIcon(
    opts?: ExtendedOcticonRenderOptions,
): string {
    const prefilledOpts: Required<OcticonRenderOptions> = {
        color: opts?.color ?? GITHUB_GREEN_4_HEX,
        viewBox: opts?.viewBox ?? calculateViewbox("0 0 24 24", opts),
    };
    return renderOcticon(REVIEW_REQUESTED_ICON, prefilledOpts);
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
