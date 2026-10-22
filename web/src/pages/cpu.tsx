import { Format } from "@nand2tetris/simulator/cpu/memory.js";
import { Timer } from "@nand2tetris/simulator/timer.js";

import { Keyboard } from "@nand2tetris/components/chips/keyboard";
import MemoryComponent from "@nand2tetris/components/chips/memory.js";
import { Screen, ScreenScales } from "@nand2tetris/components/chips/screen.js";
import { useContext, useEffect, useRef, useState } from "react";

import { Trans } from "@lingui/react/macro";
import { CPU_LAYOUT } from "../../../presentation/build/layouts.js";
import { useStateInitializer } from "@nand2tetris/components/react";
import { Runbar } from "@nand2tetris/components/runbar";
import { BaseContext } from "@nand2tetris/components/stores/base.context";
import { isPath } from "../shell/file_select";
import { AppContext } from "../App.context";
import { PageContext } from "../Page.context";
import { SchemaLayout } from "../presentation/SchemaLayout";
import { Accordian } from "../shell/panel";
import { TestPanel } from "../shell/test_panel";
import "./cpu.scss";

export const CPU = () => {
  const { filePicker } = useContext(AppContext);
  const { setTool, stores } = useContext(PageContext);
  const { state, actions, dispatch } = stores.cpu;
  const { fs } = useContext(BaseContext);

  const [tst, setTst] = useStateInitializer(state.test.tst);
  const [out, setOut] = useStateInitializer(state.test.out);
  const [cmp, setCmp] = useStateInitializer(state.test.cmp);
  const [tstPath, setTstPath] = useState<string>();
  const [screenRenderKey, setScreenRenderKey] = useState(0);

  useEffect(() => {
    setTool("cpu");
  }, [setTool]);

  useEffect(() => {
    actions.compileTest(tst, cmp, tstPath);
    actions.reset();
  }, [tst, cmp, tstPath]);

  const cpuRunner = useRef<Timer>();
  const testRunner = useRef<Timer>();
  const [runnersAssigned, setRunnersAssigned] = useState(false);
  useEffect(() => {
    cpuRunner.current = new (class CPUTimer extends Timer {
      override async tick() {
        actions.tick();
        return false;
      }

      override finishFrame() {
        dispatch.current({ action: "update" });
      }

      override reset() {
        actions.reset();
      }

      override toggle() {
        dispatch.current({ action: "update" });
      }
    })();

    testRunner.current = new (class CPUTestTimer extends Timer {
      override async tick() {
        return actions.testStep();
      }

      override finishFrame() {
        dispatch.current({ action: "update" });
      }

      override reset() {
        actions.reset();
      }

      override toggle() {
        dispatch.current({ action: "update" });
      }
    })();
    setRunnersAssigned(true);

    return () => {
      cpuRunner.current?.stop();
      testRunner.current?.stop();
    };
  }, [actions, dispatch]);

  const setPath = async (fullPath: string) => {
    setTstPath(fullPath);
    actions.setPath(fullPath);
    actions.reset();
  };

  const rerenderScreen = () => {
    setScreenRenderKey(screenRenderKey + 1);
  };

  const onMemoryChange = () => {
    rerenderScreen();
  };

  const onKeyChange = () => {
    dispatch.current({ action: "update" });
  };

  const onScale = (scale: ScreenScales) => {
    dispatch.current({
      action: "updateConfig",
      payload: { screenScale: scale },
    });
  };

  const loadFile = async () => {
    const file = await filePicker.selectAllowLocal({
      suffix: [".asm", ".hack"],
    });
    const title = isPath(file)
      ? (file.path.split("/").pop() ?? "")
      : Array.isArray(file)
        ? file[0].name
        : file.name;
    dispatch.current({ action: "setTitle", payload: title });
    if (isPath(file)) {
      setPath(file.path);
      return {
        name: file.path.split("/").pop() ?? "",
        content: await fs.readFile(file.path),
      };
    } else {
      actions.clearTest();
      return Array.isArray(file) ? file[0] : file;
    }
  };

  const rom = (
    <MemoryComponent
      name="ROM"
      memory={state.sim.ROM}
      highlight={state.sim.PC}
      format={state.config.romFormat}
      fileSelect={loadFile}
      onSetFormat={(format: Format) => {
        dispatch.current({
          action: "updateConfig",
          payload: { romFormat: format },
        });
      }}
      onClear={() => actions.clear()}
      loadTooltip={{
        value: "Load an .asm or .hack file",
        placement: "right",
      }}
    />
  );

  const ram = (
    <MemoryComponent
      name="RAM"
      memory={state.sim.RAM}
      format={state.config.ramFormat}
      excludedFormats={["asm"]}
      onChange={onMemoryChange}
      onSetFormat={(format: Format) => {
        dispatch.current({
          action: "updateConfig",
          payload: { ramFormat: format },
        });
      }}
    />
  );

  const ioHeader = (
    <div className="flex-1">
      {runnersAssigned && cpuRunner.current && (
        <Runbar
          runner={cpuRunner.current}
          speed={state.config.speed}
          onSpeedChange={(speed) => {
            dispatch.current({
              action: "updateConfig",
              payload: { speed },
            });
          }}
        />
      )}
    </div>
  );

  const ioBody = (
    <>
      <Screen
        key={screenRenderKey}
        memory={state.sim.Screen}
        showScaleControls={true}
        scale={state.config.screenScale}
        onScale={onScale}
      />
      <Keyboard update={onKeyChange} keyboard={state.sim.Keyboard} />
      <Accordian summary={<Trans>Registers</Trans>} open={true}>
        <main>
          <div>
            <dl>
              <dt>PC</dt>
              <dd data-testid="register-PC">{state.sim.PC}</dd>
              <dt>A</dt>
              <dd data-testid="register-A">{state.sim.A}</dd>
              <dt>D</dt>
              <dd data-testid="register-D">{state.sim.D}</dd>
            </dl>
          </div>
        </main>
      </Accordian>
    </>
  );

  const test = runnersAssigned ? (
    <TestPanel
      runner={testRunner}
      tst={[tst, setTst, state.test.highlight]}
      out={[out, setOut]}
      cmp={[cmp, setCmp]}
      setPath={setTstPath}
      tstName={state.test.name}
      disabled={!state.test.valid}
      showName={state.tests.length < 2}
      speed={state.config.testSpeed}
      onSpeedChange={(speed) => {
        dispatch.current({
          action: "updateConfig",
          payload: { testSpeed: speed },
        });
        actions.setAnimate(speed <= 2);
      }}
      prefix={
        state.tests.length > 1 ? (
          <select
            value={state.test.name}
            onChange={({ target: { value } }) => {
              actions.loadTest(value);
            }}
            data-testid="test-picker"
          >
            {state.tests.map((testName) => (
              <option key={testName} value={testName}>
                {testName}
              </option>
            ))}
          </select>
        ) : (
          <></>
        )
      }
    />
  ) : undefined;

  return (
    <SchemaLayout
      schema={CPU_LAYOUT}
      dynamicTokens={{
        "cpu.root": [
          state.config.screenScale == 2 ? "screen-large" : "screen-normal",
        ],
      }}
      slots={{
        "cpu.rom": rom,
        "cpu.ram": ram,
        "cpu.io.header": ioHeader,
        "cpu.io.body": ioBody,
        "cpu.test": test,
      }}
    />
  );};

export default CPU;
