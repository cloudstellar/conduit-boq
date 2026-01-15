'use client';

import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/auth/UserMenu";
import AuthGuard from "@/components/auth/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex justify-between items-start mb-4">
            <div className="text-center md:text-left flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                ระบบประมาณราคาท่อร้อยสายสื่อสารใต้ดิน
              </h1>
              <p className="mt-1 text-sm md:text-base text-gray-600">Conduit Bill of Quantity (BOQ)</p>
            </div>
            <div className="flex items-center gap-4">
              <UserMenu />
              <Image
                src="/nt_logo.svg"
                alt="NT Logo"
                width={441}
                height={85}
                className="object-contain w-24 sm:w-32 md:w-48 h-auto hidden sm:block"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create New BOQ Card */}
          <Link
            href="/boq/create"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              สร้างใบประมาณราคาใหม่
            </h2>
            <p className="text-gray-600">
              สร้าง BOQ ใหม่สำหรับโครงการก่อสร้างท่อร้อยสาย
            </p>
          </Link>

          {/* View BOQ List Card */}
          <Link
            href="/boq"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-500"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              รายการใบประมาณราคา
            </h2>
            <p className="text-gray-600">ดูและจัดการใบประมาณราคาทั้งหมด</p>
          </Link>

          {/* Price List Card */}
          <Link
            href="/price-list"
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-500"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              บัญชีราคามาตรฐาน
            </h2>
            <p className="text-gray-600">ดูรายการราคามาตรฐานประจำปี 2568</p>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">รายการราคามาตรฐาน</p>
            <p className="text-3xl font-bold text-gray-900">518</p>
            <p className="text-sm text-gray-500">รายการ</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">หมวดหมู่</p>
            <p className="text-3xl font-bold text-gray-900">52</p>
            <p className="text-sm text-gray-500">หมวด</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500">ปีบัญชีราคา</p>
            <p className="text-3xl font-bold text-gray-900">2568</p>
            <p className="text-sm text-gray-500">พ.ศ.</p>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}
