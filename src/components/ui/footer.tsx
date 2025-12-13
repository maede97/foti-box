import Image from 'next/image';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary sticky bottom-0 w-full">
      <div className="flex items-center justify-center space-y-0 space-x-2 md:flex-row md:space-y-0 md:space-x-2">
        <Image src="/foti-box.png" alt="foti-box.com" width={60} height={40} priority />
        <div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
          <h3 className="text-xl font-semibold tracking-wide uppercase">foti-box.com</h3>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
