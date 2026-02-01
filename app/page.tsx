'use client';

import Link from "next/link";
import Image from "next/image";
import UserMenu from "@/components/auth/UserMenu";
import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Plus, FileText, DollarSign, Clock, Edit } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const isPending = user?.status === 'pending';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const needsOnboarding = isPending && !(user as any)?.onboarding_completed;

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
                <p className="mt-1 text-sm md:text-base text-muted-foreground">Conduit Bill of Quantity (BOQ)</p>
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
          {/* Welcome Card for New Users */}
          {needsOnboarding && (
            <Card className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                      <Edit className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      ยินดีต้อนรับ! กรุณาลงทะเบียนข้อมูลของคุณ
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      เพื่อเริ่มใช้งานระบบ กรุณากรอกข้อมูลส่วนตัวและเลือกสังกัดของคุณ
                      ผู้ดูแลระบบจะตรวจสอบและอนุมัติบัญชีของคุณภายหลัง
                    </p>
                    <Link href="/profile">
                      <Button className="bg-amber-500 hover:bg-amber-600">
                        <Edit className="w-4 h-4 mr-2" />
                        กรอกข้อมูลและเลือกสังกัด
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Status Banner (after onboarding completed) */}
          {isPending && !needsOnboarding && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <Clock className="h-4 w-4 text-amber-600" />
              <AlertDescription className="ml-2 text-amber-800">
                <span className="font-medium">บัญชีของคุณอยู่ระหว่างรอผู้ดูแลระบบอนุมัติ</span>
                {' — คุณสามารถสร้างและแก้ไข BOQ ได้ระหว่างรอ'}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New BOQ Card */}
            <Link href="/boq/create" className="group">
              <Card className="h-full hover:shadow-lg transition-shadow border-2 border-transparent group-hover:border-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    สร้างใบประมาณราคาใหม่
                  </h2>
                  <p className="text-muted-foreground">
                    สร้าง BOQ ใหม่สำหรับโครงการก่อสร้างท่อร้อยสาย
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* View BOQ List Card */}
            <Link href="/boq" className="group">
              <Card className="h-full hover:shadow-lg transition-shadow border-2 border-transparent group-hover:border-green-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <FileText className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    รายการใบประมาณราคา
                  </h2>
                  <p className="text-muted-foreground">ดูและจัดการใบประมาณราคาทั้งหมด</p>
                </CardContent>
              </Card>
            </Link>

            {/* Price List Card */}
            <Link href="/price-list" className="group">
              <Card className="h-full hover:shadow-lg transition-shadow border-2 border-transparent group-hover:border-purple-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <DollarSign className="w-8 h-8 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    บัญชีราคามาตรฐาน
                  </h2>
                  <p className="text-muted-foreground">ดูรายการราคามาตรฐานประจำปี 2568</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">รายการราคามาตรฐาน</p>
                <p className="text-3xl font-bold text-gray-900">662</p>
                <p className="text-sm text-muted-foreground">รายการ</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">หมวดหมู่</p>
                <p className="text-3xl font-bold text-gray-900">52</p>
                <p className="text-sm text-muted-foreground">หมวด</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">ปีบัญชีราคา</p>
                <p className="text-3xl font-bold text-gray-900">2568</p>
                <p className="text-sm text-muted-foreground">พ.ศ.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
