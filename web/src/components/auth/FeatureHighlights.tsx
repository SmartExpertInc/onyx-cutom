import { Sparkles, Users, TrendingUp, User, Star } from "lucide-react";

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
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Why choose our platform?
      </h2>
      <div className="space-y-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className={`${feature.color} rounded-full p-3 flex-shrink-0`}>
              <feature.icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {feature.title}
              </h3>
              <p className="text-gray-900 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        {/* Review 1 */}
        <div className="bg-white backdrop-blur-md border border-white/30 rounded-2xl p-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Sara Johnson</h4>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>
          <p className="text-gray-700 text-sm">
            &ldquo;This platform transformed how our team creates training materials. The quality is outstanding!&rdquo;
          </p>
        </div>

        {/* Review 2 */}
        <div className="bg-white backdrop-blur-md border border-white/30 rounded-2xl p-4" style={{backgroundColor: 'rgba(255, 255, 255, 0.2)'}}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Michael Chen</h4>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          </div>
          <p className="text-gray-700 text-sm">
            &ldquo;Incredible value and ease of use. I&rsquo;ve created more content in a month than I did all last year.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}