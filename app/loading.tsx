export default function Loading() {
  return (
    <main className="min-h-screen">
      {/* 
        We mimic the Hero section structure: 
        min-h-screen, flex-col-reverse on mobile, flex-row on desktop, items-center.
      */}
      <section className="relative min-h-screen flex items-center pt-16 animate-pulse">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <div className="flex flex-col-reverse md:flex-row items-center gap-12 md:gap-16">
            
            {/* Text side skeleton */}
            <div className="flex-1 w-full flex flex-col items-center md:items-start text-center md:text-start">
              
              {/* Greeting */}
              <div 
                className="w-24 h-4 rounded-md mb-4" 
                style={{ backgroundColor: 'var(--primary-accent)', opacity: 0.5 }}
              />
              
              {/* Name H1 */}
              <div className="flex flex-col items-center md:items-start gap-2 mb-6 w-full">
                <div className="w-3/4 max-w-md h-10 sm:h-12 lg:h-14 rounded-2xl" style={{ backgroundColor: 'var(--glass-border)' }} />
              </div>
              
              {/* Role */}
              <div className="w-1/2 max-w-xs h-6 rounded-lg mb-6" style={{ backgroundColor: 'var(--secondary-accent)', opacity: 0.5 }} />
              
              {/* Bio */}
              <div className="flex flex-col items-center md:items-start gap-2 mb-8 w-full max-w-lg">
                <div className="w-full h-4 rounded-md" style={{ backgroundColor: 'var(--glass-border)', opacity: 0.7 }} />
                <div className="w-full h-4 rounded-md" style={{ backgroundColor: 'var(--glass-border)', opacity: 0.7 }} />
                <div className="w-4/5 h-4 rounded-md" style={{ backgroundColor: 'var(--glass-border)', opacity: 0.7 }} />
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 justify-center md:justify-start w-full">
                <div className="w-32 h-11 rounded-full" style={{ backgroundColor: 'var(--glass-border)' }} />
                <div className="w-32 h-11 rounded-full border" style={{ borderColor: 'var(--glass-border)' }} />
              </div>

              {/* Social Icons */}
              <div className="flex flex-wrap gap-2 mt-8 justify-center md:justify-start w-full">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className="w-9 h-9 rounded-full" 
                    style={{ backgroundColor: 'var(--glass-border)', opacity: 0.6 }} 
                  />
                ))}
              </div>
            </div>

            {/* Profile Photo skeleton */}
            <div className="flex-shrink-0">
              <div className="relative w-56 h-56 sm:w-72 sm:h-72">
                <div className="absolute inset-0 rounded-full" style={{ backgroundColor: 'var(--glass-border)', opacity: 0.5 }} />
              </div>
            </div>
          </div>
          
          {/* Scroll Hint */}
          <div className="w-full flex justify-center mt-16">
             <div className="w-32 h-3 rounded-full" style={{ backgroundColor: 'var(--glass-border)', opacity: 0.4 }} />
          </div>
        </div>
      </section>
    </main>
  )
}
