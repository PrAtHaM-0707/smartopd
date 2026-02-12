import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock, RefreshCw, Smartphone, UserPlus, Ticket, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/PublicLayout";

const steps = [
  { icon: UserPlus, title: "Register", description: "Enter your name and phone number to get started" },
  { icon: Ticket, title: "Get Token", description: "Receive your unique token number instantly" },
  { icon: BarChart3, title: "Track Queue", description: "Monitor your position in real-time from anywhere" },
];

const benefits = [
  { icon: Clock, title: "No Waiting", description: "Skip the physical queue and wait comfortably anywhere" },
  { icon: RefreshCw, title: "Real-time Updates", description: "Live queue position updates every few seconds" },
  { icon: Smartphone, title: "Simple Process", description: "Easy registration with just your name and phone" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-[0.04]" />
        <div className="container py-20 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
              Digital Queue Management
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Skip Hospital Lines.{" "}
              <span className="text-primary">Get Your Token Online.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-lg mx-auto">
              SmartOPD helps patients register and track queues remotely — saving time and reducing stress.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2 text-base">
                <Link to="/register">
                  <UserPlus className="w-4 h-4" />
                  Register Patient
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2 text-base">
                <Link to="/queue">
                  <BarChart3 className="w-4 h-4" />
                  Check Queue
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-card">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">How It Works</h2>
            <p className="mt-2 text-muted-foreground">Three simple steps to skip the line</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative text-center p-6 rounded-xl border bg-background shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute top-4 right-4 text-4xl font-extrabold text-muted/60">
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{step.description}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why SmartOPD?</h2>
            <p className="mt-2 text-muted-foreground">Designed for patients, loved by hospitals</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="p-6 rounded-xl border bg-card shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center mb-4">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{b.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
