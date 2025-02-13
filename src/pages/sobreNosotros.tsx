import { Building2, Users, Clock, Medal } from "lucide-react";
import "./SobreNosotros.css"; // Importamos el CSS separado

export default function SobreNosotrosPage() {
    return (
        <div className="sobre-nosotros-container">
            {/* Hero Section */}
            <div className="sentroseccion">
                <h1 className="Printitle">Sobre Nosotros</h1>
                <p className="subtitulos">
                    En Tites Import & Export S.R.L., nos dedicamos a proporcionar soluciones integrales en importación y exportación, 
                    conectando negocios y mercados con eficiencia y profesionalismo.
                </p>
            </div>

   
            <div className="espaciado">
                <div className="rectangleformato">
                    {[
                        { Icon: Building2, title: "Empresa Líder", text: "Más de 10 años de experiencia en el mercado internacional" },
                        { Icon: Users, title: "Equipo Profesional", text: "Expertos dedicados a brindar el mejor servicio a nuestros clientes" },
                        { Icon: Clock, title: "Servicio 24/7", text: "Atención continua para satisfacer tus necesidades comerciales" },
                        { Icon: Medal, title: "Calidad Garantizada", text: "Compromiso con la excelencia en cada operación" }
                    ].map(({ Icon, title, text }, index) => (
                        <div key={index} className="cartaprin">
                            <div className="iconosrectangulo">
                                <Icon className="icon" />
                            </div>
                            <h3 className="titulos2">{title}</h3>
                            <p className="subtitulos2">{text}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="seccioninfo">
                <h2 className="tituloinfo">Nuestra Misión</h2>
                <p className="infotexto">
                    Facilitar el comercio internacional proporcionando soluciones logísticas 
                    eficientes y servicios de alta calidad que impulsen el éxito de nuestros clientes.
                </p>
                <h2 className="tituloinfo">Nuestra Visión</h2>
                <p className="infotexto">
                    Ser reconocidos como el socio estratégico líder en servicios de importación 
                    y exportación, destacando por nuestra innovación, confiabilidad y compromiso 
                    con la excelencia.
                </p>
            </div>
        </div>
    );
}
