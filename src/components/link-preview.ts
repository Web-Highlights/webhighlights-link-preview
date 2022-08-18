import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { LinkMetaData } from "../../netlify/functions/meta";
import { truncateString } from "../shared/helper";

import ComponentStyles from "./link-preview.scss";

export interface LinkPreviewProps {
  url: string;
  baseUrl: string;
  baseUrlFallback: string;
  metaDataFallback: LinkMetaData;
}

@customElement("webhighlights-link-preview")
class LinkPreview extends LitElement {
  @property() api: string = "http://localhost:3000/meta";
  @property() url!: string;
  @property() titleFallback!: string;
  @property() descriptionFallback!: string;
  @property() imageFallback!: string;

  @property() metaData: LinkMetaData | undefined;

  static get styles() {
    return [ComponentStyles];
  }

  get metaFallback(): LinkMetaData {
    return {
      title: this.titleFallback,
      description: this.descriptionFallback,
      url: this.url,
    };
  }

  get meta(): LinkMetaData {
    return {
      ...this.metaFallback,
      ...this.metaData,
    };
  }

  get loading() {
    return typeof this.metaData === "undefined";
  }

  firstUpdated() {
    const encodedUrl = encodeURIComponent(this.url);
    fetch(`${this.api}/${encodedUrl}`)
      .then(async (data) => {
        try {
          const metaData = await data.json();
          this.metaData = metaData;
        } catch (error) {
          this.metaData = {};
        }
      })
      .catch(() => (this.metaData = {}));
  }

  get loadingClass() {
    return this.loading ? "loading" : "";
  }

  get description() {
    const metaDescription = this.meta?.description ?? "";
    return truncateString(metaDescription, 75);
  }

  get previewUrl() {
    if (this.loading) return "";
    const urlWithoutSchema = this.url.split("//")[1];
    return truncateString(urlWithoutSchema, 32);
  }

  get title(): string {
    return truncateString(this.loading ? "" : this.meta?.title ?? "", 45);
  }

  get imageSrc(): string {
    if (this.loading) return "";
    console.log(this.meta);
    return (
      this.meta?.image?.url ??
      this.imageFallback ??
      "https://web-highlights.com/images/fallback-image.png"
    );
  }

  render() {
    return html`
      <div class="link-preview-meta-info-container ${this.loadingClass}">
        <header class="link-preview-meta-info-header ${this.loadingClass}">
          ${this.title}
        </header>
        <main class="link-preview-meta-info-description ${this.loadingClass}">
          <span>${this.description}</span>
        </main>
        <footer class="link-preview-meta-info-footer ${this.loadingClass}">
          <span class="link-preview-meta-info-footer-url"
            >${this.previewUrl}</span
          >
        </footer>
      </div>
      ${this.loading
        ? html` <div class="link-preview-image ${this.loadingClass}"></div> `
        : html`
            <img
              class="link-preview-image"
              src="${this.imageSrc}"
              alt="Link preview image"
            />
          `}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "webhighlights-link-preview": LinkPreview;
  }
}
