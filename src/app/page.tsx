const HomePage: React.FC = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="mb-4 text-4xl font-semibold tracking-wide uppercase">foti-box.com</h1>

      <span className="text-sm tracking-wide uppercase">
        Anfrage?{' '}
        <a
          className="text-stone-200 underline hover:text-stone-400"
          href="mailto:anfrage@foti-box.com"
        >
          anfrage@foti-box.com
        </a>
      </span>
    </div>
  );
};

export default HomePage;
