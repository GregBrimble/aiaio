import packageJsonRaw from "../../../package.json" with { type: "json" };
import { Schema } from "effect";

const PackageJSON = Schema.Struct({
	name: Schema.NonEmptyString,
	homepage: Schema.URLFromString,
	title: Schema.NonEmptyString,
	version: Schema.NonEmptyString,
});

export default Schema.decodeUnknownSync(PackageJSON)(packageJsonRaw);
