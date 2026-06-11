function Contact() {
  return (
    <main className="page-shell">
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
