import { Sparkles, Users, TrendingUp } from "lucide-react";

export default function FeatureHighlights() {
  const features = [
    {
      icon: Sparkles,
      color: "bg-purple-500",
      title: "Rich content creation",
      description: "We produce video lessons, presentations, one-pagers, quizzes, and course outlines."
    },
    {
      icon: Users,
      color: "bg-pink-500",
      title: "For everyone",
      description: "Perfect for corporate and individual clients seeking quality educational content."
    },
    {
      icon: TrendingUp,
      color: "bg-blue-500",
      title: "Growing community",
      description: "Join our thriving community of active users and educators worldwide."
    }
  ];

  return (
    <div className="flex-1 max-w-lg">
      <h2 className="text-3xl font-bold text-white mb-8">
        Why choose our platform?
      </h2>
      <div className="space-y-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className={`${feature.color} rounded-full p-3 flex-shrink-0`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
