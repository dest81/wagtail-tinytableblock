from django.templatetags.static import static
from django.urls import reverse
from django.utils.html import format_html
from wagtail import hooks


@hooks.register("insert_editor_js")
def editor_js():
    page_chooser_url = reverse("wagtailadmin_choose_page")
    external_link_chooser_url = reverse("wagtailadmin_choose_page_external_link")
    email_link_chooser_url = reverse("wagtailadmin_choose_page_email_link")
    phone_link_chooser_url = reverse("wagtailadmin_choose_page_phone_link")
    anchor_link_chooser_url = reverse("wagtailadmin_choose_page_anchor_link")

    return format_html(
        """
        <script>
            window.chooserUrls = window.chooserUrls || {{}};
            window.chooserUrls.pageChooser = '{}';
            window.chooserUrls.externalLinkChooser = '{}';
            window.chooserUrls.emailLinkChooser = '{}';
            window.chooserUrls.phoneLinkChooser = '{}';
            window.chooserUrls.anchorLinkChooser = '{}';
        </script>
        """,
        page_chooser_url,
        external_link_chooser_url,
        email_link_chooser_url,
        phone_link_chooser_url,
        anchor_link_chooser_url,
    )
