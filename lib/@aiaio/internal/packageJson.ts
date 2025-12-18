import packageJsonRaw from "../../../package.json" with { type: "json" };
import { Schema } from "effect";

const PackageJSON = Schema.Struct({
	name: Schema.NonEmptyString,
	title: Schema.NonEmptyString,
	version: Schema.NonEmptyString,
});

export default Schema.decodeSync(PackageJSON)(packageJsonRaw);
