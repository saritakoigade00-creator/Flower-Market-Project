import "./Home.css";

function Home({ onLogin, onRegister }) {
  return (
    <div className="flower-home">
      {/* Top Bar */}
      <div className="flower-topbar">
        <span>✿</span> Fresh Flowers, Beautiful Moments
        <span className="topbar-right">
          Carefully selected blooms for every occasion
        </span>
      </div>

      {/* Navigation */}
      <header className="flower-header">
        <a href="#home" className="flower-brand">
          <span className="brand-icon">✿</span>
          <span className="brand-text">
            <strong>Bloom<span>Market</span></strong>
            <small>FLOWER MARKET DISPATCH</small>
          </span>
        </a>

        <nav className="flower-nav">
          <a href="#home">Home</a>
          <a href="#services">Our Services</a>
          <a href="#about">About Us</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="flower-auth">
          <button
            className="flower-login"
            onClick={onLogin}
          >
            Login
          </button>

          <button
            className="flower-register"
            onClick={onRegister}
          >
            Register <span>↗</span>
          </button>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="flower-hero" id="home">
          <div className="flower-hero-content">
            <div className="flower-label">
              <span>✿</span> YOUR TRUSTED FLOWER PARTNER
            </div>

            <h1>
              Nature's beauty,
              <br />
              delivered with
              <br />
              <em>love & care.</em>
            </h1>

            <p className="flower-hero-description">
              Discover the beauty of fresh flowers and
              thoughtful floral arrangements. We bring
              growers, flower sellers and customers
              together through a simpler flower dispatch
              experience.
            </p>

            <div className="flower-hero-buttons">
              <button
                className="hero-primary"
                onClick={onRegister}
              >
                Get Started <span>↗</span>
              </button>

              <button
                className="hero-secondary"
                onClick={onLogin}
              >
                Sign In <span>→</span>
              </button>
            </div>

            <div className="flower-trust">
              <div className="trust-icon">✓</div>
              <div>
                <strong>Freshness meets reliability</strong>
                <small>
                  A smarter way to manage flower dispatch
                </small>
              </div>
            </div>
          </div>

          <div className="flower-hero-image">
            <img
              src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85"
              alt="Fresh seasonal flowers in beautiful colours"
            />

            <div className="image-caption">
              <span className="caption-flower">✿</span>
              <div>
                <strong>Flowers that speak</strong>
                <small>When words are not enough.</small>
              </div>
            </div>

            <div className="image-decoration">❋</div>
          </div>

          <div className="hero-number">01 / BLOOM BEAUTIFULLY</div>
        </section>

        {/* Services */}
        <section className="flower-services" id="services">
          <div className="service-heading">
            <span className="section-label">
              WHAT MAKES US DIFFERENT
            </span>

            <h2>
              Every flower deserves
              <br />
              <em>the perfect journey.</em>
            </h2>

            <p>
              Thoughtfully designed to make flower
              ordering and dispatch easier.
            </p>
          </div>

          <div className="service-grid">
            <article className="service-card">
              <div className="service-icon">🌿</div>
              <span>01</span>
              <h3>Fresh Flowers</h3>
              <p>
                Celebrate life's moments with beautiful
                seasonal blooms and floral arrangements.
              </p>
            </article>

            <article className="service-card">
              <div className="service-icon">📦</div>
              <span>02</span>
              <h3>Easy Dispatch</h3>
              <p>
                Organise flower orders and simplify the
                dispatch process in one place.
              </p>
            </article>

            <article className="service-card">
              <div className="service-icon">🤝</div>
              <span>03</span>
              <h3>Reliable Service</h3>
              <p>
                Bring customers, staff and administrators
                together with a connected workflow.
              </p>
            </article>
          </div>
        </section>

        {/* About */}
        <section className="flower-about" id="about">
          <div className="about-image">
            <img
              src="https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=1000&q=85"
              alt="A carefully arranged collection of flowers"
              loading="lazy"
            />
          </div>

          <div className="about-content">
            <span className="section-label">
              OUR STORY
            </span>

            <h2>
              More than flowers.
              <br />
              <em>A connection that blooms.</em>
            </h2>

            <p>
              Flower Market Dispatch is designed to
              simplify the journey of flowers from
              selection to dispatch. Our goal is to
              provide an organised digital experience
              for customers, staff and administrators.
            </p>

            <div className="about-points">
              <div>
                <span>✓</span>
                <p>
                  <strong>Customer focused</strong>
                  <small>A simple, welcoming experience.</small>
                </p>
              </div>

              <div>
                <span>✓</span>
                <p>
                  <strong>Organised workflow</strong>
                  <small>Designed for easier order handling.</small>
                </p>
              </div>
            </div>

            <button
              className="about-button"
              onClick={onRegister}
            >
              Join Our Community ↗
            </button>
          </div>
        </section>

        {/* Call to Action */}
        <section className="flower-cta" id="contact">
          <span>✿ LET SOMETHING BEAUTIFUL BEGIN</span>

          <h2>
            Ready to make your
            <br />
            next move <em>bloom?</em>
          </h2>

          <p>
            Join Flower Market Dispatch and discover a
            simpler flower management experience.
          </p>

          <button
            className="cta-button"
            onClick={onRegister}
          >
            Create Your Account ↗
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="flower-footer">
        <a href="#home" className="flower-brand footer-brand">
          <span className="brand-icon">✿</span>
          <span className="brand-text">
            <strong>Bloom<span>Market</span></strong>
            <small>FLOWER MARKET DISPATCH</small>
          </span>
        </a>

        <p>Bringing nature's beauty closer to you.</p>

        <div className="footer-links">
          <a href="#home">Home</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <button onClick={onLogin}>Login</button>
          <button onClick={onRegister}>Register</button>
        </div>

        <div className="footer-bottom">
          © 2026 Flower Market Dispatch. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;