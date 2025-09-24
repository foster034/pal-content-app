'use client';

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Star,
  Award,
  Briefcase,
  Clock,
  CheckCircle,
  Building2,
  User,
  Shield,
  Edit,
  Send,
  Eye,
  Users,
  Activity,
  Globe,
  ChevronRight,
  Hash,
  Target
} from "lucide-react";

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'technician' | 'franchisee';
  data: any;
  onEdit?: (data: any) => void;
  onSendMagicLink?: (data: any) => void;
  onViewAs?: (data: any) => void;
}

export function DetailModal({
  isOpen,
  onClose,
  type,
  data,
  onEdit,
  onSendMagicLink,
  onViewAs
}: DetailModalProps) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0 border-0 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),_0_10px_10px_-5px_rgba(0,0,0,0.04)] rounded-3xl bg-white">
        <DialogTitle className="sr-only">
          {type === 'technician' ? 'Technician Details' : 'Franchisee Details'}
        </DialogTitle>
        {type === 'technician' ? (
          <TechnicianDetails
            data={data}
            onEdit={onEdit}
            onSendMagicLink={onSendMagicLink}
            onViewAs={onViewAs}
            onClose={onClose}
          />
        ) : (
          <FranchiseeDetails
            data={data}
            onEdit={onEdit}
            onSendMagicLink={onSendMagicLink}
            onViewAs={onViewAs}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TechnicianDetails({ data, onEdit, onSendMagicLink, onViewAs, onClose }: any) {
  return (
    <div className="flex flex-col bg-gradient-to-br from-slate-50 to-white">
      {/* Modern Header with Floating Avatar */}
      <div className="relative">
        <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute -bottom-12 left-6">
          <Avatar className="w-24 h-24 border-4 border-white shadow-xl ring-1 ring-gray-100">
            <AvatarImage src={data.image} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold">
              {data.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {onEdit && (
            <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm" onClick={() => { onEdit(data); onClose(); }}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onViewAs && (
            <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm" onClick={() => onViewAs(data)}>
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{data.name}</h2>
            <p className="text-gray-500 font-medium">{data.username}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={data.status === 'Active' ? 'default' : 'secondary'} className="font-semibold px-3 py-1.5 rounded-full shadow-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${data.status === 'Active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              {data.status}
            </Badge>
          </div>
        </div>

        {data.loginCode && (
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Login Code</span>
              <code className="bg-white px-3 py-1.5 rounded-lg font-mono text-sm font-semibold text-gray-900 shadow-sm border">
                {data.loginCode}
              </code>
            </div>
          </div>
        )}
      </div>

      {/* Modern Stats Cards */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.jobCount || 0}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">Jobs Completed</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold text-gray-900">{data.performance || 0}</p>
                  <div className="flex items-center ml-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= (data.performance || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500 mt-1">Rating</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600 fill-current" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.techCount || 0}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">Team Size</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {data.createdAt ? `${new Date().getFullYear() - new Date(data.createdAt).getFullYear()}y` : '0y'}
                </p>
                <p className="text-sm font-medium text-gray-500 mt-1">Experience</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        {/* Franchise Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Franchise Info</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium text-gray-500">Franchise</span>
                <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                  {data.franchiseeName || 'Not assigned'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <span className="text-sm font-medium text-gray-500">Territory</span>
                <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                  {data.territory || 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </span>
                <a href={`mailto:${data.email}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 text-right max-w-[60%] truncate">
                  {data.email}
                </a>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </span>
                <a href={`tel:${data.phone}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 text-right max-w-[60%]">
                  {data.phone || 'Not provided'}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Performance & Specialties */}
        {(data.specialties && data.specialties.length > 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-50 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Specialties</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.specialties.map((specialty: string, index: number) => (
                  <Badge key={index} variant="outline" className="px-3 py-1.5 rounded-full bg-gray-50 border-gray-200 text-gray-700 font-medium">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Account Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Account Info</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </span>
                <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                  {data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Last Active
                </span>
                <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                  {data.lastActive ? new Date(data.lastActive).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'Never'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
        <div className="flex flex-col gap-4">
          {onSendMagicLink && (
            <Button
              onClick={() => onSendMagicLink(data)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
            >
              <Send className="w-5 h-5 mr-2" />
              Send Magic Link
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-2xl transition-all duration-200"
          >
            Close
          </Button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          Last updated {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function FranchiseeDetails({ data, onEdit, onSendMagicLink, onViewAs, onClose }: any) {
  return (
    <div className="flex flex-col bg-gradient-to-br from-slate-50 to-white">
      {/* Modern Header with Floating Logo */}
      <div className="relative">
        <div className="h-28 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute -bottom-12 left-6">
          {data.logo ? (
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-xl ring-1 ring-gray-100 bg-white">
              <img src={data.logo} alt={data.name} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl ring-1 ring-gray-100 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Building2 className="w-12 h-12 text-white" />
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          {onEdit && (
            <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm" onClick={() => { onEdit(data); onClose(); }}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onViewAs && (
            <Button variant="ghost" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm" onClick={() => onViewAs(data)}>
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-16 px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{data.name}</h2>
            <p className="text-gray-500 font-medium">{data.territory}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={data.status === 'Active' ? 'default' : 'secondary'} className="font-semibold px-3 py-1.5 rounded-full shadow-sm">
              <div className={`w-2 h-2 rounded-full mr-2 ${data.status === 'Active' ? 'bg-green-400' : 'bg-gray-400'}`}></div>
              {data.status}
            </Badge>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Team Size</span>
            <span className="bg-white px-3 py-1.5 rounded-lg font-semibold text-gray-900 shadow-sm border">
              {data.techCount || 0} Technicians
            </span>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.activeJobs || 0}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">Active Jobs</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.completedJobs || 0}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">Completed</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.rating || 0}/5</p>
                <p className="text-sm font-medium text-gray-500 mt-1">Rating</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.techCount || 0}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">Team Members</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        {/* Business Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Business Info</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm font-medium text-gray-500">Business Name</span>
                <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                  {data.businessName || data.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm font-medium text-gray-500">Territory</span>
                <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                  {data.territory}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-500">Country</span>
                <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                  {data.country || 'Canada'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        {data.owners && data.owners.filter((o: any) => o.isPrimary).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Primary Owner</h3>
              </div>
              {data.owners.filter((o: any) => o.isPrimary).map((owner: any) => (
                <div key={owner.id} className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12 border-2 border-gray-200">
                      <AvatarImage src={owner.image} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold">
                        {owner.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{owner.name}</p>
                      <p className="text-sm text-gray-500">Primary Owner</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-3 border-b border-gray-50">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </span>
                      <a href={`mailto:${owner.email}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 text-right max-w-[60%] truncate">
                        {owner.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone
                      </span>
                      <a href={`tel:${owner.phone}`} className="text-sm font-semibold text-blue-600 hover:text-blue-700 text-right max-w-[60%]">
                        {owner.phone}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Account Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Account Info</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-50">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </span>
                <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                  {data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  }) : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Status
                </span>
                <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">
                  {data.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="p-6 border-t border-gray-100 bg-gray-50/50">
        <div className="flex flex-col gap-4">
          {onSendMagicLink && (
            <Button
              onClick={() => onSendMagicLink(data)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-2xl transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40"
            >
              <Send className="w-5 h-5 mr-2" />
              Send Magic Link
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full border-2 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-2xl transition-all duration-200"
          >
            Close
          </Button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-4">
          Last updated {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}