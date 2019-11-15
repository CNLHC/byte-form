import React from "react";
import { getForm } from "../src/index";
import renderer from "react-test-renderer";

test("HelloWorld", () => {
  const [formAction, Form] = getForm({});
  const component = renderer.create(<Form formMeta={[]} />);
  expect(component).toMatchSnapshot();
  console.log(component.toTree());
});
