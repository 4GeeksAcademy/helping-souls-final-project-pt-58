export const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <h3 className="footer-title">
        We invite you to explore these organizations and help more souls.
      </h3>

      <div className="footer-orgs">
        <a
          href="https://www.greenpeace.org/international/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-org"
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpLjMKW1BNUjTuw-5jinklXmE8ExI4C2QVzA&s"
            alt="Greenpeace"
          />
          <span>Greenpeace</span>
        </a>

        <a
          href="https://www.savethechildren.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-org"
        >
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSp8Y6f1wDdnycGJHS9RVVq5hfuuRcedS6WHQ&s"
            alt="Save the Children"
          />
          <span>Save the Children</span>
        </a>

        <a
          href="https://www.icrc.org/en"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-org"
        >
          <img
            src="https://www.redcross.org/content/dam/redcross/International-Services/global-network-icrc.png.transform/1288/q82/feature/image.png"
            alt="Red Cross"
          />
          <span>Red Cross</span>
        </a>

        <a
          href="https://www.unicef.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-org"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/f/fb/UNICEF_Logo_%28cropped%29.png"
            alt="UNICEF"
          />
          <span>UNICEF</span>
        </a>
      </div>

      <p className="footer-copy">
        © 2026 Helping Souls · Together we create impact
      </p>
    </div>
  </footer>
);

