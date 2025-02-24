import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="flex flex-col-reverse gap-y-10 md:flex-row items-center justify-between w-full max-w-7xl">
        <div className="md:w-1/2 text-center md:text-left mt-6 md:mt-0">
          <h1 className="text-3xl md:text-4xl font-bold">Coming Soon...</h1>
        </div>
        <div className="flex justify-center">
          <img
            src="images/mockup.png"
            alt="Mockup"
            className="h-auto w-full max-w-4xl"
          />
        </div>
      </div>
    </div>
  );
}