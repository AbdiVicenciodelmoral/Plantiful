function Contact() {
  return (
      <main className="page-shell">
          <img src="../../public/images/plants/6.png" class="vine vine-contact-1"></img>
          <img src="../../public/images/plants/1.png" class="vine vine-contact-2"></img>
          <img src="../../public/images/plants/7.png" class="vine vine-contact-3"></img>
      <section className="page-heading">
        <h1>Contact Us</h1>
        <p>
          Future support form that can store messages, simulate emails, and
          support email-header injection or stored support-message XSS lessons.
        </p>
      </section>

      <section className="contact-panel">
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" type="email" placeholder="you@example.com" />

        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" placeholder="Tell us how we can help." />

        <button type="button">Send message</button>
      </section>
    </main>
  );
}

export default Contact;
