import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Property } from "@/lib/types";

interface FlyerProps {
  property: Property;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  brokerageName: string;
  variant?: string;
}

const gold = "#c9a962";
const navy = "#0f172a";
const lightGold = "#f5ecd7";

const styles = StyleSheet.create({
  page: {
    backgroundColor: navy,
    fontFamily: "Helvetica",
    color: "#ffffff",
  },
  header: {
    backgroundColor: gold,
    paddingVertical: 8,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: navy,
    letterSpacing: 3,
  },
  headerMls: {
    fontSize: 8,
    color: navy,
    opacity: 0.7,
  },
  photoContainer: {
    height: 310,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noPhoto: {
    fontSize: 14,
    color: "#64748b",
  },
  priceSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  price: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: gold,
  },
  address: {
    fontSize: 13,
    color: lightGold,
    marginTop: 4,
  },
  cityLine: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: gold,
    opacity: 0.3,
    marginHorizontal: 24,
    marginVertical: 10,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 24,
    justifyContent: "space-around",
    paddingVertical: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: gold,
  },
  statLabel: {
    fontSize: 8,
    color: "#94a3b8",
    letterSpacing: 1,
    marginTop: 2,
  },
  descriptionSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: gold,
    letterSpacing: 2,
    marginBottom: 6,
  },
  description: {
    fontSize: 9,
    color: "#cbd5e1",
    lineHeight: 1.5,
  },
  featuresSection: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  featureItem: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  featureBullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: gold,
    marginRight: 6,
  },
  featureText: {
    fontSize: 8,
    color: "#e2e8f0",
  },
  bottomSection: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  agentBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#1e293b",
  },
  agentName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  agentDetail: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 2,
  },
  qrPlaceholder: {
    width: 60,
    height: 60,
    borderWidth: 1,
    borderColor: gold,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  qrText: {
    fontSize: 6,
    color: "#64748b",
    textAlign: "center",
  },
  footer: {
    backgroundColor: gold,
    paddingVertical: 6,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: navy,
    fontFamily: "Helvetica-Bold",
  },
  footerMls: {
    fontSize: 7,
    color: navy,
    opacity: 0.7,
  },
});

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export default function LuxuryFlyer({
  property,
  agentName,
  agentPhone,
  agentEmail,
  brokerageName,
  variant,
}: FlyerProps) {
  const label = variant || "JUST LISTED";
  const descriptionText = property.description
    ? property.description.length > 400
      ? property.description.slice(0, 400) + "..."
      : property.description
    : null;

  const displayFeatures = property.features.slice(0, 10);
  const hasPhoto = property.photos.length > 0;

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>{label}</Text>
          <Text style={styles.headerMls}>MLS# {property.mls_id}</Text>
        </View>

        {/* Photo */}
        <View style={styles.photoContainer}>
          {hasPhoto ? (
            <Image src={property.photos[0]} style={styles.photo} />
          ) : (
            <Text style={styles.noPhoto}>No Photo Available</Text>
          )}
        </View>

        {/* Price & Address */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatPrice(property.price)}</Text>
          <Text style={styles.address}>{property.address}</Text>
          <Text style={styles.cityLine}>
            {property.city}, {property.state} {property.zip}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{property.bedrooms}</Text>
            <Text style={styles.statLabel}>BEDS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{property.bathrooms}</Text>
            <Text style={styles.statLabel}>BATHS</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatNumber(property.sqft)}
            </Text>
            <Text style={styles.statLabel}>SQ FT</Text>
          </View>
          {property.lot_size && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatNumber(property.lot_size)}
              </Text>
              <Text style={styles.statLabel}>LOT SQ FT</Text>
            </View>
          )}
          {property.year_built && (
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{property.year_built}</Text>
              <Text style={styles.statLabel}>YEAR BUILT</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Description */}
        {descriptionText && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>PROPERTY DESCRIPTION</Text>
            <Text style={styles.description}>{descriptionText}</Text>
          </View>
        )}

        {/* Features */}
        {displayFeatures.length > 0 && (
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>FEATURES</Text>
            <View style={styles.featuresGrid}>
              {displayFeatures.map((feature, i) => (
                <View key={i} style={styles.featureItem}>
                  <View style={styles.featureBullet} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.agentBar}>
            <View>
              <Text style={styles.agentName}>{agentName}</Text>
              <Text style={styles.agentDetail}>{brokerageName}</Text>
              <Text style={styles.agentDetail}>
                {agentPhone} | {agentEmail}
              </Text>
            </View>
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrText}>QR{"\n"}CODE</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Listed on OneMLS.pro</Text>
            <Text style={styles.footerMls}>MLS# {property.mls_id}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
