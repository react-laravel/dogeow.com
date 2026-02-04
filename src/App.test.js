import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders beian record", () => {
  render(<App />);
  const recordElement = screen.getByText("闽ICP备19021694号");
  expect(recordElement).toBeInTheDocument();
});
