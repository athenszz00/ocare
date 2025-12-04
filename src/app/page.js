"use client";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 font-sans">
      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-10 flex flex-col items-center gap-6">
        <h1 className="text-3xl font-bold text-center">Scan QR Code</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Arahkan kamera ponselmu untuk memindai kode di bawah ini 👇
        </p>

        <Image
          src="/LoginO-Care.png"
          alt="QR Code"
          width={250}
          height={250}
          className="rounded-lg border border-gray-300 dark:border-gray-700"
          priority
        />

        <p className="text-sm text-gray-500 mt-4">
          Scan QR Code untuk lanjut Login atau bisa klik link /localhost:3000/ 
        </p>
      </div>
    </div>
  );
}