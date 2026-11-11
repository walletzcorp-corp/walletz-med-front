import "./header.css";
import logoImage from "../../assets/logo-fundotransparente-pequena.png";

function HeaderSite() {
  return (
    <header className="App-header">
      <div className="logo">
        <img
          src={logoImage}
          alt="Logo da Walletz Med"
          className="logo-image"
          height="50"
        />
        <span className="logo-text">Walletz Med</span>
      </div>
    </header>
  );
}

export default HeaderSite;
