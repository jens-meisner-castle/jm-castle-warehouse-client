import { Typography, styled } from "@mui/material";
import React, { ReactNode } from "react";
import ReactDOM from "react-dom/client";
import { ExtensionWrapper } from "./ExtensionWrapper";

const CustomerStuff = styled("span")({ variant: "H1" });
// the extensions from the customer
const extensions: Record<string, (payload: string) => React.ReactNode> = {
  HotStuff: (payload) => <Typography>{payload}</Typography>,
  CustomerStuff: (payload) => <CustomerStuff>{payload}</CustomerStuff>,
  Empty: (payload) => <></>,
};

export class ReactExtension extends HTMLElement {
  private shadow: ShadowRoot;
  private reactRoot: ReactDOM.Root;
  private extension: (payload: string) => ReactNode;

  constructor() {
    super();
    console.log("new ReactExtension");
    this.shadow = this.attachShadow({ mode: "open" });
    this.reactRoot = ReactDOM.createRoot(this.shadow);
    this.extension = extensions.Empty;
  }

  static get observedAttributes() {
    return ["payload", "component"];
  }

  get payload(): string | null {
    return this.getAttribute("payload");
  }

  set payload(payload: string) {
    this.setAttribute("payload", payload);
  }

  get component(): string | null {
    return this.getAttribute("component");
  }

  set component(component: string) {
    this.setAttribute("component", component);
  }

  updateReact() {
    const comp = this.getAttribute("component");
    const extension = extensions[comp || "Empty"] || extensions["Empty"];
    this.reactRoot.render(
      <ExtensionWrapper
        payload={this.getAttribute("payload") || ""}
        component={extension}
      />
    );
  }

  connectedCallback() {
    this.reactRoot.render(
      <ExtensionWrapper
        payload={this.getAttribute("payload") || ""}
        component={this.extension}
      />
    );
    this.updateReact();
  }

  disconnectedCallback() {
    this.reactRoot && this.reactRoot.unmount();
  }

  attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown) {
    console.log("attributeChanged", name, newValue);
    if (name === "payload" || name === "component") {
      this.updateReact();
    }
  }
}

// to fix: Property 'react-extension' does not exist on type 'JSX.IntrinsicElements'
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "react-extension": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { payload: string; component: string };
    }
  }
}
