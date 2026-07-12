(function () {
  window.addEventListener("tinymce:init", function (e) {
    const config = e.detail.config;
    config.external_plugins = config.external_plugins || {};
    config.external_plugins["wagtaillink"] = document.currentScript.src;
  });

  tinymce.PluginManager.add("wagtaillink", function (editor, url) {
    editor.ui.registry.addToggleButton("wagtaillink", {
      icon: "link",
      tooltip: "Insert Wagtail Universal Link",

      // monitors cursor focus and toggles active icon status
      onSetup: function (buttonApi) {
        const checkNodeChange = function () {
          const isLink = editor.dom.getParent(editor.selection.getNode(), "a");
          buttonApi.setActive(!!isLink);
        };
        editor.on("NodeChange", checkNodeChange);
        return function () {
          editor.off("NodeChange", checkNodeChange);
        };
      },

      onAction: function () {
        const selection = editor.selection;
        const activeLinkNode = editor.dom.getParent(selection.getNode(), "a");
        const selectedText = selection.getContent({ format: "text" });

        const urlParams = {
          page_type: "wagtailcore.page",
          allow_external_link: "true",
          allow_email_link: "true",
          allow_phone_link: "true",
          allow_anchor_link: "true",
          link_text:
            selectedText || (activeLinkNode ? activeLinkNode.textContent : ""),
        };

        let pageChooserURL = window.chooserUrls.pageChooser;

        if (activeLinkNode) {
          const pageType = activeLinkNode.getAttribute("linktype");
          const href = activeLinkNode.getAttribute("href");

          if (pageType === "page") {
            const pageId = activeLinkNode.getAttribute("id");
            if (pageId) {
              const base = window.chooserUrls.pageChooser;
              pageChooserURL = `${base}${pageId}/`;
            }
          } else if (href) {
            if (href.startsWith("mailto:")) {
              pageChooserURL = window.chooserUrls.emailLinkChooser;
              urlParams.link_url = href.replace("mailto:", "");
            } else if (href.startsWith("tel:")) {
              pageChooserURL = window.chooserUrls.phoneLinkChooser;
              urlParams.link_url = href.replace("tel:", "");
            } else if (href.startsWith("#")) {
              pageChooserURL = window.chooserUrls.anchorLinkChooser;
              urlParams.link_url = href.replace("#", "");
            } else {
              pageChooserURL = window.chooserUrls.externalLinkChooser;
              urlParams.link_url = href;
            }
          }
        }

        ModalWorkflow({
          url: pageChooserURL,
          urlParams: urlParams,
          onload: window.PAGE_CHOOSER_MODAL_ONLOAD_HANDLERS || {},
          responses: {
            pageChosen: function (data) {
              const isInternalPage = data.id !== undefined && data.id !== null;

              if (isInternalPage) {
                const linkText = selectedText || data.title;
                editor.execCommand("mceInsertLink", false, {
                  href: data.url,
                  linktype: "page",
                  id: data.id,
                  text: linkText,
                });
              } else {
                const linkText = selectedText || data.title || data.url;
                let insertOptions = {
                  href: data.url,
                  text: linkText,
                };

                if (data.linktype) {
                  insertOptions.linktype = data.linktype;
                }

                editor.execCommand("mceInsertLink", false, insertOptions);
              }
            },
          },
        });
      },
    });

    return {
      getMetadata: function () {
        return { name: "Wagtail Universal Link Chooser Adapter" };
      },
    };
  });
})();
