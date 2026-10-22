import { ABOUT_LAYOUT } from "../../../presentation/build/layouts.js";
import { SchemaLayout } from "../presentation/SchemaLayout";
import Markdown from "../shell/markdown";
import aboutContent from "./ABOUT.md?raw";

const VERSION =
  document.querySelector("meta[name=version]")?.getAttribute("content") ??
  "unknown";

const useVersion = () => {
  return VERSION;
};

export const About = () => {
  const version = useVersion();

  const body = (
    <>
      <Markdown>{aboutContent}</Markdown>
      <p>
        <b>Version</b> <code>{version}</code>
      </p>
    </>
  );

  return (
    <SchemaLayout
      schema={ABOUT_LAYOUT}
      containerProps={{
        "about.root": { style: { overflowY: "scroll" } },
      }}
      slots={{ "about.body": body }}
    />
  );
};

export default About;
