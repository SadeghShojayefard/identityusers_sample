import { SubmissionResult } from "@conform-to/react";


export type ActionResult =
    | SubmissionResult<string[]>
    | {
        status: "success" | "error" | "success-2fa" | "password-expired";
        payload?: any;
    }
    | undefined;

export function hasPayload(
    result: ActionResult
): result is { status: "success" | "error"; payload?: any } {
    return !!result && "payload" in result;
}
