
export default function Footer() { // un footer pour donner le contact en cas de bug, pour indiquer le nom du développeur, le nom du bds, mettre le copyrigth

    return (
        <footer className="text-center text-lg-start small pt-2 d-flex flex-column justify-content-center align-items-center gap-0" style={{ backgroundColor: '#242d52' }} >
            <div className="text-center pt-3">
                <span className="text-light"><a className="text-underline-hover fst-italic text-light" href="mailto:mael.aubert@bds-efrei.fr">Contactez nous</a> pour une quelconque question ou un bug </span>
            </div>
            <div className="text-center">
            </div>
            <div className="text-center pb-3">
            <a className="text-underline-hover text-light" href="/mentions-legales">Mentions légales</a>

                <span className="text-light"> | © 2024{' '}
                    <a className="text-underline-hover text-light" href="https://www.linkedin.com/in/mael-aubert/">Maël Aubert</a>
                </span>
            </div>
        </footer>
    );

}