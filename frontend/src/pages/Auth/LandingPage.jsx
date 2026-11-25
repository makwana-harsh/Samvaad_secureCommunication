import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MessageCircle, Radio, Send, ShieldCheck, Users } from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle.jsx";
import "../../styles/Auth/LandingPage.style.css";

const EASE = [0.22, 1, 0.36, 1];
const TITLE = "Welcome to the secure communication platform".split(" ");

const SCRIPT = [
    { me: false, name: "Aarav", text: "Are we still on for tonight?" },
    { me: true, text: "Yes! Sending the plan now." },
    { me: false, name: "Meera", text: "Add me to the group too 🙌" },
    { me: true, text: "Done. See you all at 8." },
];

const FEATURES = [
    { Icon: ShieldCheck, title: "Private by default", text: "Secure sign-in and one-to-one chats that stay between you and your friends." },
    { Icon: Users, title: "Groups your way", text: "Create private groups or join public ones, and invite people in a tap." },
    { Icon: Radio, title: "Live presence", text: "See who is online right now and jump straight into the conversation." },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };
const word = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: EASE } },
};
const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE, delay },
});

function ChatDemo() {
    const [shown, setShown] = useState(0);

    useEffect(() => {
        const t = setTimeout(
            () => setShown((s) => (s < SCRIPT.length ? s + 1 : 0)),
            shown === 0 ? 1000 : shown < SCRIPT.length ? 1800 : 3800
        );
        return () => clearTimeout(t);
    }, [shown]);

    const typing = shown < SCRIPT.length && !SCRIPT[shown].me;

    return (
        <div className="chat-demo">
            <div className="cd-head">
                <span className="cd-avatar">W</span>
                <div>
                    <strong>Weekend Trip</strong>
                    <small><i className="cd-dot" /> 12 members</small>
                </div>
            </div>

            <div className="cd-body">
                <AnimatePresence initial={false}>
                    {SCRIPT.slice(0, shown).map((m, i) => (
                        <motion.div
                            key={i}
                            layout
                            className={`cd-msg ${m.me ? "me" : ""}`}
                            initial={{ opacity: 0, y: 14, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.25 } }}
                            transition={{ type: "spring", stiffness: 380, damping: 26 }}
                        >
                            {!m.me && <b>{m.name}</b>}
                            {m.text}
                        </motion.div>
                    ))}
                    {typing && (
                        <motion.div key="typing" layout className="cd-msg cd-typing"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <i /><i /><i />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="cd-input">
                <span>Type a message...</span>
                <span className="cd-send"><Send size={14} /></span>
            </div>
        </div>
    );
}

function LandingPage() {
    const navigate = useNavigate();

    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 150, damping: 18 });
    const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 150, damping: 18 });

    const onMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => { mx.set(0); my.set(0); };

    return (
        <div className="lp">
            <div className="lp-bg" aria-hidden="true">
                <span className="lp-orb o1" /><span className="lp-orb o2" /><span className="lp-orb o3" />
                <span className="lp-grid" />
            </div>

            <div className="lp-content">
                <motion.nav className="lp-nav" {...fadeUp(0)}>
                    <div className="lp-logo">
                        <span className="header-logo-mark"><MessageCircle size={18} strokeWidth={2.4} /></span>
                        <span className="header-logo-text">Samvaad</span>
                    </div>
                    <div className="lp-nav-actions">
                        <ThemeToggle />
                        <button className="pill-btn pill-btn--ghost" onClick={() => navigate("/login")}>Login</button>
                    </div>
                </motion.nav>

                <section className="lp-hero">
                    <div className="lp-copy">
                        <motion.span className="lp-badge" {...fadeUp(0.1)}>
                            <ShieldCheck size={14} /> Secure messaging
                        </motion.span>

                        <motion.h1 className="lp-title" variants={container} initial="hidden" animate="show">
                            {TITLE.map((w, i) => (
                                <motion.span key={i} className="lp-word" variants={word}>{w}</motion.span>
                            ))}
                        </motion.h1>

                        <motion.p className="lp-lead" {...fadeUp(0.8)}>
                            Chat with friends, join public groups and see who is online, all in one calm, fast place.
                        </motion.p>

                        <motion.div className="lp-cta" {...fadeUp(0.95)}>
                            <motion.button className="pill-btn lp-shine" whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                                onClick={() => navigate("/register")}>
                                Create account
                            </motion.button>
                            <motion.button className="pill-btn pill-btn--ghost" whileHover={{ y: -3 }} whileTap={{ scale: 0.96 }}
                                onClick={() => navigate("/login")}>
                                I already have an account
                            </motion.button>
                        </motion.div>
                    </div>

                    <motion.div className="lp-visual" onMouseMove={onMove} onMouseLeave={onLeave}
                        initial={{ opacity: 0, y: 40, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}>
                        <motion.div style={{ rotateX, rotateY, transformPerspective: 900 }}>
                            <ChatDemo />
                        </motion.div>
                        <span className="lp-float f1"><span className="cd-dot" /> 3 friends online</span>
                        <span className="lp-float f2"><Users size={14} /> New group invite</span>
                    </motion.div>
                </section>

                <section className="lp-features">
                    {FEATURES.map(({ Icon, title, text }, i) => (
                        <motion.div key={title} className="lp-feature"
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                            whileHover={{ y: -6 }}>
                            <span className="lp-feature-icon"><Icon size={20} /></span>
                            <h3>{title}</h3>
                            <p>{text}</p>
                        </motion.div>
                    ))}
                </section>
            </div>
        </div>
    );
}

export default LandingPage;
