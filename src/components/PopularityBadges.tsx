import { PopularityBadge } from "@/lib/popularity";
import { motion } from "framer-motion";

interface PopularityBadgesProps {
  badges: PopularityBadge[];
  size?: "sm" | "md";
}

const badgeStyles: Record<PopularityBadge["type"], string> = {
  almost_sold_out: "bg-destructive/20 text-destructive",
  trending: "bg-primary/20 text-primary",
  hot: "bg-[hsl(40,100%,50%)]/20 text-[hsl(40,100%,50%)]",
  friends_going: "bg-success/20 text-success",
  new: "bg-accent/20 text-accent",
};

const PopularityBadges = ({ badges, size = "sm" }: PopularityBadgesProps) => {
  if (badges.length === 0) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {badges.map((badge, i) => (
        <motion.span
          key={badge.type}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className={`inline-flex items-center gap-1 rounded-full font-mono font-bold tracking-wide ${
            badgeStyles[badge.type]
          } ${size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"}`}
        >
          {badge.emoji} {badge.label}
        </motion.span>
      ))}
    </div>
  );
};

export default PopularityBadges;
