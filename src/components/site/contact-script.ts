// The contact form's script, as text for the inline script tag (ContactForm.astro). It is built here, not typed into the
// component, because two things in it depend on the page's language: the label on the button while the message is on its
// way (the dictionary's formSending), and, on a page in another language only, the `language` field in the post. The
// English page's script is the same text it always was. Nothing in this file or the tests posts to the form service.
const quote = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

export function contactScript(sending: string, withLanguage: boolean): string {
  return String.raw`
  (function () {
    var form = document.getElementById('cf-form');
    var done = document.getElementById('cf-done');
    var error = document.getElementById('cf-error');
    if (!form || !done) return;
    var params = new URLSearchParams(window.location.search);
    var search = window.location.search.replace(/^\?/, '');
    form.elements['lead'].value = params.get('lead') || '';
    form.elements['link'].value = search;
    var button = form.querySelector('.cf-send');
    var label = button.textContent;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var f = form.elements;
      var data = {
        name_company: f['name_company'].value,
        email: f['email'].value,
        message: f['message'].value,
        page: window.location.pathname + window.location.search,
        segment: f['segment'].value,
        country: f['country'].value,
${withLanguage ? "        language: f['language'].value,\n" : ''}        lead: f['lead'].value,
        link: f['link'].value,
        _gotcha: f['_gotcha'].value,
        _subject: 'Message from einvoiceops.eu'
      };
      error.hidden = true;
      button.disabled = true;
      button.textContent = ${quote(sending)};
      fetch('https://formspree.io/f/xnjwvnvb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (res) {
        if (!res.ok) throw new Error('rejected');
        form.hidden = true;
        done.hidden = false;
        done.scrollIntoView({ block: 'nearest' });
      }).catch(function () {
        button.disabled = false;
        button.textContent = label;
        error.hidden = false;
      });
    });
  })();
`;
}
