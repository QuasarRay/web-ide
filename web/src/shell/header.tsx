import { BaseContext } from "@nand2tetris/components/stores/base.context";
import {
  GUIDE_LINKS,
  HEADER_ACTIONS,
  LAST_ROUTE_KEY,
  ROUTES,
  TOOLS,
  type RouteId,
  type ShellActionSchema,
} from "../../../presentation/build/navigation.js";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../App.context";
import { PageContext } from "../Page.context";
import { Icon } from "../pico/icon";

const GUIDE_NOT_AVAILABLE_MESSAGE = "Guide not available for this tool";

function routeFromPath(pathname: string) {
  return Object.values(ROUTES).find((route) => route.href === pathname);
}

const Header = () => {
  const appContext = useContext(AppContext);
  const baseContext = useContext(BaseContext);
  const { title, setTool } = useContext(PageContext);
  const navigate = useNavigate();
  const location = useLocation();

  const activeRoute = routeFromPath(location.pathname);

  const openGuide = (routeId?: RouteId) => {
    const pdfLink = routeId ? GUIDE_LINKS[routeId] : undefined;
    if (!pdfLink) {
      baseContext.setStatus(GUIDE_NOT_AVAILABLE_MESSAGE);
      return;
    }

    // Keep this synchronous inside the click event so popup blockers retain
    // the browser user-gesture permission.
    window.open(
      import.meta.env.BASE_URL + pdfLink,
      "_blank",
      "width=1000,height=800",
    );
  };

  const runAction = (action: ShellActionSchema) => {
    baseContext.setStatus("");
    setTool(
      action.kind === "route" && action.route
        ? ROUTES[action.route].tool
        : undefined,
    );

    switch (action.kind) {
      case "route": {
        if (!action.route) return;
        const route = ROUTES[action.route];
        localStorage.setItem(LAST_ROUTE_KEY, route.href);
        navigate(route.href);
        return;
      }
      case "external":
        if (action.href) {
          window.open(action.href, "new");
        }
        return;
      case "command":
        if (action.command === "settings") {
          appContext.settings.open();
        } else if (action.command === "guide") {
          openGuide(activeRoute?.id);
        }
    }
  };

  return (
    <header>
      <nav style={{ width: "100%" }}>
        <ul>
          <li>
            <strong>
              <a
                href="https://nand2tetris.org"
                target="_blank"
                rel="noreferrer"
              >
                NAND2Tetris
              </a>
            </strong>
            {activeRoute?.tool && ` / ${TOOLS[activeRoute.tool]}`}
            {title && ` / ${title}`}
          </li>
        </ul>
        <ul className="icon-list">
          {HEADER_ACTIONS.map((action) => (
            <li
              key={action.id}
              data-tooltip={action.tooltip}
              data-placement="bottom"
              onClick={() => runAction(action)}
            >
              <Icon name={action.icon}></Icon>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
