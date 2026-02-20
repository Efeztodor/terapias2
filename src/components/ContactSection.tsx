import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
const ContactSection = () => {
  return <section id="contacto" className="py-24 bg-lavender">
      <div className="container mx-auto px-4">
        <motion.div initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.8
      }} className="text-center mb-16">
          <p className="text-sm tracking-[0.25em] uppercase text-primary font-medium mb-3">
            Contacto
          </p>
          <h2 className="text-3xl md:text-5xl font-heading font-light">
            Hablemos de tu{" "}
            <span className="italic font-medium text-gradient-primary">bienestar</span>
          </h2>
        </motion.div>

        <div className="max-w-lg mx-auto">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="flex flex-col gap-6">
            <div className="rounded-2xl bg-card border border-border/50 p-5 hover:shadow-md transition-shadow">
              <h3 className="text-xs text-muted-foreground mb-1">Correo electrónico</h3>
              <a href="mailto:paola.terapeuta@gmail.com" className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary">
                  <Mail size={20} />
                </div>
                <p className="text-sm font-medium">paola.terapeuta@gmail.com</p>
              </a>
            </div>

            









            <div className="flex items-center gap-4 rounded-2xl bg-card border border-border/50 p-5">
              <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ubicación</p>
                <p className="text-sm font-medium">Consulta presencial y online</p>
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border/50 p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Redes sociales</p>
                  <p className="text-sm font-medium">Sígueme en mis redes</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pl-14">
                <h3 className="text-xs text-muted-foreground font-normal">
                  <a href="https://www.facebook.com/profile.php?id=100063763223659" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors">
                    <Facebook size={20} />
                    <span>Facebook</span>
                  </a>
                </h3>
                <h3 className="text-xs text-muted-foreground font-normal">
                  <a href="https://instagram.com/paola.cyc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors">
                    <Instagram size={20} />
                    <span>Instagram</span>
                  </a>
                </h3>
                <h3 className="text-xs text-muted-foreground font-normal">
                  <a href="https://youtube.com/@pao.terapeuta" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors">
                    <Youtube size={20} />
                    <span>YouTube</span>
                  </a>
                </h3>
                <h3 className="text-xs text-muted-foreground font-normal">
                  <a href="https://www.tiktok.com/@paola.terapeuta.cyc" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm font-medium hover:text-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>
                    <span>TikTok</span>
                  </a>
                </h3>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
};
export default ContactSection;