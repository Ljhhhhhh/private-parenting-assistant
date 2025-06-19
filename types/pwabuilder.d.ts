declare module '@pwabuilder/pwainstall' {
  export {};
}

// PWABuilder组件的全局声明
declare global {
  interface HTMLElementTagNameMap {
    'pwa-install': HTMLElement & {
      showDialog?: boolean;
      showopen?: boolean;
      showDescription?: boolean;
      showScreenshots?: boolean;
      showFeatures?: boolean;
      installButtonText?: string;
      description?: string;
      features?: string;
      primaryColor?: string;
      backgroundColor?: string;
      hideAfterInstall?: boolean;
      preventDialog?: boolean;
    };
  }
}
