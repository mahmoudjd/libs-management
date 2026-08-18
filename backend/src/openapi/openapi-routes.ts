import type { Response, Router } from "express"

import { createOpenApiDocument } from "./openapi-document"
import type { AppContext } from "../context/app-ctx"

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}

function renderOpenApiDocsHtml(specUrl: string, scriptUrl: string) {
  const safeSpecUrl = escapeHtml(specUrl)
  const safeScriptUrl = escapeHtml(scriptUrl)

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Libraries Management API Docs</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #0f172a;
        --panel: #111827;
        --panel-2: #1f2937;
        --text: #e5e7eb;
        --muted: #94a3b8;
        --line: #334155;
        --get: #0f766e;
        --post: #166534;
        --put: #7c2d12;
        --patch: #7c3aed;
        --delete: #b91c1c;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background: var(--bg);
        color: var(--text);
      }

      main {
        max-width: 1120px;
        margin: 0 auto;
        padding: 32px 20px 56px;
      }

      h1, h2, h3, p {
        margin: 0;
      }

      .hero {
        display: grid;
        gap: 12px;
        margin-bottom: 24px;
      }

      .hero p {
        color: var(--muted);
        line-height: 1.5;
      }

      .hero-links {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .hero-links a {
        color: var(--text);
        text-decoration: none;
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 10px 14px;
        background: rgba(17, 24, 39, 0.8);
      }

      .tag {
        margin-top: 24px;
        border: 1px solid var(--line);
        border-radius: 8px;
        overflow: hidden;
        background: rgba(17, 24, 39, 0.72);
      }

      .tag-header {
        padding: 16px 18px;
        border-bottom: 1px solid var(--line);
        background: rgba(31, 41, 55, 0.7);
      }

      .tag-header p {
        margin-top: 6px;
        color: var(--muted);
      }

      .op {
        padding: 16px 18px;
        border-top: 1px solid var(--line);
        display: grid;
        gap: 10px;
      }

      .op:first-of-type {
        border-top: 0;
      }

      .op-top {
        display: flex;
        gap: 12px;
        align-items: center;
        flex-wrap: wrap;
      }

      .method {
        min-width: 72px;
        text-align: center;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
      }

      .method.get { background: var(--get); }
      .method.post { background: var(--post); }
      .method.put { background: var(--put); }
      .method.patch { background: var(--patch); }
      .method.delete { background: var(--delete); }

      code {
        font-family: "SFMono-Regular", ui-monospace, Menlo, Monaco, Consolas, monospace;
        font-size: 13px;
      }

      .meta, .responses, .schemas {
        display: grid;
        gap: 8px;
      }

      .meta small {
        color: var(--muted);
      }

      pre {
        margin: 0;
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: rgba(15, 23, 42, 0.8);
        color: var(--text);
        overflow: auto;
        white-space: pre-wrap;
        word-break: break-word;
      }

      .empty {
        color: var(--muted);
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <h1>Libraries Management API</h1>
        <p>Documentation is rendered directly from the backend OpenAPI document.</p>
        <div class="hero-links">
          <a href="${safeSpecUrl}">OpenAPI JSON</a>
        </div>
      </section>
      <div id="app">
        <p class="empty">Loading specification...</p>
      </div>
    </main>
    <script src="${safeScriptUrl}"></script>
  </body>
</html>`
}

function renderOpenApiDocsScript(specUrl: string) {
  return `
      const specUrl = ${JSON.stringify(specUrl)};
      const container = document.getElementById("app");

      function toPrettyJson(value) {
        if (value === undefined) {
          return "";
        }
        return JSON.stringify(value, null, 2);
      }

      function createNode(html) {
        const template = document.createElement("template");
        template.innerHTML = html.trim();
        return template.content.firstChild;
      }

      function renderOperations(spec) {
        const tagMeta = new Map((spec.tags || []).map((tag) => [tag.name, tag]));
        const grouped = new Map();

        for (const [path, pathItem] of Object.entries(spec.paths || {})) {
          for (const method of Object.keys(pathItem)) {
            const operation = pathItem[method];
            const tags = operation.tags && operation.tags.length ? operation.tags : ["Other"];
            const tagName = tags[0];
            if (!grouped.has(tagName)) {
              grouped.set(tagName, []);
            }
            grouped.get(tagName).push({ path, method, operation });
          }
        }

        container.innerHTML = "";

        for (const [tagName, operations] of grouped.entries()) {
          const meta = tagMeta.get(tagName) || { name: tagName, description: "" };
          const tagElement = createNode(
            '<section class="tag"><div class="tag-header"><h2></h2><p></p></div><div class="tag-body"></div></section>'
          );

          tagElement.querySelector("h2").textContent = meta.name || tagName;
          tagElement.querySelector("p").textContent = meta.description || "";

          const body = tagElement.querySelector(".tag-body");
          for (const entry of operations) {
            const op = entry.operation;
            const requestBody = op.requestBody && op.requestBody.content
              ? op.requestBody.content["application/json"]
              : null;

            const params = (op.parameters || []).map((param) => ({
              name: param.name,
              in: param.in,
              required: Boolean(param.required),
              schema: param.schema,
            }));

            const responses = Object.entries(op.responses || {}).map(([status, response]) => ({
              status,
              description: response.description || "",
            }));

            const opElement = createNode(
              '<article class="op"><div class="op-top"><span class="method"></span><code></code></div><h3></h3><p class="empty summary"></p><div class="meta"></div><div class="responses"></div></article>'
            );

            const methodNode = opElement.querySelector(".method");
            methodNode.textContent = entry.method.toUpperCase();
            methodNode.classList.add(entry.method);

            opElement.querySelector("code").textContent = entry.path;
            opElement.querySelector("h3").textContent = op.summary || entry.path;

            const summaryNode = opElement.querySelector(".summary");
            summaryNode.textContent = op.description || "";
            if (!op.description) {
              summaryNode.remove();
            }

            const metaNode = opElement.querySelector(".meta");
            if (params.length > 0) {
              const block = createNode('<div><small>Parameters</small><pre></pre></div>');
              block.querySelector("pre").textContent = toPrettyJson(params);
              metaNode.appendChild(block);
            }

            if (requestBody) {
              const block = createNode('<div><small>Request body</small><pre></pre></div>');
              block.querySelector("pre").textContent = toPrettyJson(requestBody.schema);
              metaNode.appendChild(block);
            }

            if (!metaNode.children.length) {
              metaNode.remove();
            }

            const responsesNode = opElement.querySelector(".responses");
            const responseBlock = createNode('<div><small>Responses</small><pre></pre></div>');
            responseBlock.querySelector("pre").textContent = toPrettyJson(responses);
            responsesNode.appendChild(responseBlock);

            body.appendChild(opElement);
          }

          container.appendChild(tagElement);
        }
      }

      fetch(specUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Could not load OpenAPI document.");
          }
          return response.json();
        })
        .then(renderOperations)
        .catch((error) => {
          container.innerHTML = "";
          const errorNode = createNode('<p class="empty"></p>');
          errorNode.textContent = error.message;
          container.appendChild(errorNode);
        });
`
}

export function registerOpenApiRoutes(appRouter: Router, appCtx: AppContext) {
  const openApiDocument = createOpenApiDocument(appCtx)
  const openApiJsonPath = `${appCtx.config.api.prefix}/openapi.json`
  const openApiDocsPath = `${appCtx.config.api.prefix}/docs`
  const openApiDocsScriptPath = `${appCtx.config.api.prefix}/docs.js`

  appRouter.get(openApiJsonPath, (_req, res: Response) => {
    res.status(200).json(openApiDocument)
  })

  appRouter.get(openApiDocsPath, (_req, res: Response) => {
    res.status(200).type("html").send(renderOpenApiDocsHtml("./openapi.json", "./docs.js"))
  })

  appRouter.get(openApiDocsScriptPath, (_req, res: Response) => {
    res.status(200).type("application/javascript").send(renderOpenApiDocsScript("./openapi.json"))
  })
}
