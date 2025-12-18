import type { Configuration } from "lint-staged";

export default {
	"*": ["prettier --cache --write --ignore-unknown", "eslint --cache --fix"],
} satisfies Configuration;
