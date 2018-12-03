/*
 * Copyright (C) 2017 The "mysteriumnetwork/mysterium-vpn" Authors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

// @flow
import ServiceDefinitionDTO from './service-definition'
import MetricsDTO from './metrics-dto'

type Property = {
  name: string,
  type: 'number' | 'string'
}

function validate (typeName: string, obj: Object, property: Property) {
  const value = obj[property.name]
  if (value == null) {
    throw new Error(`${typeName} ${property.name} is not provided`)
  }

  const actualType = typeof value
  // eslint-disable-next-line
  if (actualType !== property.type) {
    throw new Error(`${typeName} ${property.name} should be "${property.type}" instead of "${actualType}"`)
  }
}

function validateMultiple (typeName: string, obj: Object, properties: Property[]) {
  properties.forEach(property => validate(typeName, obj, property))
}

class ProposalDTO {
  id: number
  providerId: string
  serviceType: string
  serviceDefinition: ServiceDefinitionDTO
  metrics: ?MetricsDTO

  constructor (data: Object) {
    validateMultiple(ProposalDTO.name, data, [
      { name: 'id', type: 'number' },
      { name: 'providerId', type: 'string' },
      { name: 'serviceType', type: 'string' },
      { name: 'serviceDefinition', type: 'object' }
    ])

    this.id = data.id
    this.providerId = data.providerId
    this.serviceType = data.serviceType
    if (data.serviceDefinition) {
      this.serviceDefinition = new ServiceDefinitionDTO(data.serviceDefinition)
    }
    this.metrics = data.metrics ? new MetricsDTO(data.metrics) : null
  }
}

export default ProposalDTO
