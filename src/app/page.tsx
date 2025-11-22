import { H1 } from '@/components/ui/headings';

const HomePage: React.FC = () => {
  return (
    <div className="">
      <H1>foti-box.com</H1>
      <span>
        Anfrage?{' '}
        <a className="underline" href="mailto:anfrage@foti-box.com">
          anfrage@foti-box.com
        </a>
      </span>
    </div>
  );
};

export default HomePage;
