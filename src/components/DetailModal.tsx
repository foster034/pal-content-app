'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  XCircle,
  Building2,
  User,
  Shield,
  Edit,
  Send,
  Eye
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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
    <>
      <DialogHeader className="pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {data.image ? (
                <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                data.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">{data.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{data.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={data.status === 'Active' ? 'default' : 'destructive'}>
                  {data.status}
                </Badge>
                {data.loginCode && (
                  <Badge variant="outline" className="font-mono">
                    {data.loginCode}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onViewAs && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewAs(data)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View As
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onEdit(data);
                  onClose();
                }}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </DialogHeader>

      <div className="grid gap-6 mt-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{data.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{data.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Franchise Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            Franchise Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Franchise</p>
                <p className="font-medium">{data.franchiseeName || 'Not assigned'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Territory</p>
                <p className="font-medium">{data.territory || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Performance & Skills */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Performance & Skills
          </h3>
          <div className="pl-7 space-y-4">
            {/* Rating */}
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= (data.performance || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{data.performance || 0} / 5</span>
                </div>
              </div>
            </div>

            {/* Specialties */}
            {data.specialties && data.specialties.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {data.specialties.map((specialty: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Job Count */}
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Completed Jobs</p>
                <p className="font-medium">{data.jobCount || 0} jobs</p>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Account Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">
                  {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Active</p>
                <p className="font-medium">
                  {data.lastActive ? new Date(data.lastActive).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {onSendMagicLink && (
            <Button
              variant="outline"
              onClick={() => onSendMagicLink(data)}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Magic Link
            </Button>
          )}
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}

function FranchiseeDetails({ data, onEdit, onSendMagicLink, onViewAs, onClose }: any) {
  return (
    <>
      <DialogHeader className="pb-0">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
              {data.logo ? (
                <img src={data.logo} alt={data.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-10 h-10" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">{data.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{data.territory}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={data.status === 'Active' ? 'default' : 'destructive'}>
                  {data.status}
                </Badge>
                <Badge variant="outline">
                  {data.techCount || 0} Technicians
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onViewAs && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewAs(data)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View As
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onEdit(data);
                  onClose();
                }}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </DialogHeader>

      <div className="grid gap-6 mt-6">
        {/* Business Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
            <div>
              <p className="text-sm text-muted-foreground">Business Name</p>
              <p className="font-medium">{data.businessName || data.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Territory</p>
              <p className="font-medium">{data.territory}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{data.address || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="font-medium">{data.country || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Contact Information
          </h3>
          <div className="space-y-4 pl-7">
            {/* Primary Owner */}
            {data.owners && data.owners.filter((o: any) => o.isPrimary).map((owner: any) => (
              <div key={owner.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    {owner.image ? (
                      <img src={owner.image} alt={owner.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                        {owner.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{owner.name}</p>
                    <Badge variant="outline" size="sm">Primary Owner</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-15">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{owner.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{owner.phone}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Additional Owners */}
            {data.owners && data.owners.filter((o: any) => !o.isPrimary).length > 0 && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">Additional Owners</p>
                <div className="flex flex-wrap gap-2">
                  {data.owners.filter((o: any) => !o.isPrimary).map((owner: any) => (
                    <Badge key={owner.id} variant="secondary">
                      {owner.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Performance Metrics */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pl-7">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{data.techCount || 0}</p>
              <p className="text-xs text-muted-foreground">Technicians</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{data.activeJobs || 0}</p>
              <p className="text-xs text-muted-foreground">Active Jobs</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{data.completedJobs || 0}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{data.rating || 0}/5</p>
              <p className="text-xs text-muted-foreground">Rating</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Account Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-orange-600" />
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">
                  {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Approval Status</p>
                <p className="font-medium">{data.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {onSendMagicLink && (
            <Button
              variant="outline"
              onClick={() => onSendMagicLink(data)}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Magic Link
            </Button>
          )}
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </>
  );
}