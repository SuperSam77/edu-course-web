
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Book } from "lucide-react";

export function HeroSection() {
  const { user } = useAuth();
  
  return (
    <div className="hero relative pb-20 pt-24 sm:pb-24 sm:pt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl animate-fade-in">
            Learn and Master New Skills
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-100 animate-fade-in">
            Discover high-quality courses taught by industry experts. 
            Advance your career with practical skills that matter.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {!user ? (
              <>
                <Button asChild size="lg" className="animate-fade-in">
                  <Link to="/signup">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-white/10 text-white animate-fade-in">
                  <Link to="/courses">Browse Courses</Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="animate-fade-in">
                <Link to="/courses">Explore Courses</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
      
      <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
        <div className="bg-white rounded-full p-4 shadow-lg animate-fade-in">
          <Book className="h-8 w-8 text-primary" />
        </div>
      </div>
    </div>
  );
}
