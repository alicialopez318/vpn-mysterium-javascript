/*
 * Copyright (C) 2019 The "mysteriumnetwork/mysterium-vpn-js" Authors.
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

import { TequilapiClient } from 'mysterium-tequilapi/lib/client'
import { ServiceInfoDTO } from 'mysterium-tequilapi/lib/dto/service-info'
import { ServiceStatus as ServiceStatusDTO } from 'mysterium-tequilapi/lib/dto/service-status'
import TequilapiError from 'mysterium-tequilapi/lib/tequilapi-error'
import { logger } from '../logger'
import { ServiceStatus } from '../models/service-status'
import { FunctionLooper } from './looper/function-looper'
import { Publisher } from './publisher'

export class ProviderService {
  // Currently running service instance
  private serviceInstance?: ServiceInfoDTO

  private statusPublisher: Publisher<ServiceStatus> = new Publisher()
  private statusFetcher?: FunctionLooper
  private lastStatus: ServiceStatus = ServiceStatus.NOT_RUNNING

  constructor (private tequilapiClient: TequilapiClient) {
  }

  public async checkForExistingService () {
    const service = await this.findRunningService()
    if (!service) {
      return
    }

    this.handleStartedService(service)
  }

  public async isActive (): Promise<boolean> {
    try {
      const service = await this.findRunningService()

      return !!service
    } catch (e) {
      // no need to handle
    }

    return false
  }

  public async findRunningService () {
    try {
      const services = await this.tequilapiClient.serviceList()

      return services.find(() => true)
    } catch (e) {
      // no need to handle
    }
  }

  public async start (providerId: string, serviceType: string) {
    const service = await this.tequilapiClient.serviceStart({
      providerId,
      type: serviceType
    })

    this.handleStartedService(service)
  }

  public async stop () {
    if (!this.serviceInstance) {
      throw new Error('Service id is unknown, make sure to start service before stopping it')
    }

    await this.tequilapiClient.serviceStop(this.serviceInstance.id)
    await this.stopFetchingStatus()
    this.processStatus(ServiceStatus.NOT_RUNNING)
  }

  public addStatusSubscriber (subscriber: (newStatus: ServiceStatus) => any) {
    this.statusPublisher.addSubscriber(subscriber)
    subscriber(this.lastStatus)
  }

  public removeStatusSubscriber (subscriber: (newStatus: ServiceStatus) => any) {
    this.statusPublisher.removeSubscriber(subscriber)
  }

  private handleStartedService (service: ServiceInfoDTO) {
    this.serviceInstance = service
    this.processNewServiceInfo(service)
    this.startFetchingStatus()
  }

  private startFetchingStatus () {
    this.statusFetcher = new FunctionLooper(async () => this.fetchStatus(), 1000)
    this.statusFetcher.start()
  }

  private async stopFetchingStatus () {
    if (!this.statusFetcher) {
      return
    }

    await this.statusFetcher.stop()

    this.statusFetcher = undefined
  }

  private async fetchStatus () {
    if (!this.serviceInstance) {
      logger.error('Service status fetching failed because serviceId is missing')
      return
    }

    try {
      const service = await this.tequilapiClient.serviceGet(this.serviceInstance.id)
      this.processNewServiceInfo(service)
    } catch (err) {
      if (err.name === TequilapiError.name && (err as TequilapiError).isNotFoundError) {
        this.processStatus(ServiceStatus.NOT_RUNNING)
        this.stopFetchingStatus().catch((err: Error) => logger.error('Failed stopping fetching status', err))
        return
      }

      throw err
    }
  }

  private processNewServiceInfo (info: ServiceInfoDTO) {
    const status = this.serviceStatusDTOToModel(info.status)
    this.processStatus(status)
  }

  private processStatus (status: ServiceStatus) {
    if (status === this.lastStatus) {
      return
    }

    this.statusPublisher.publish(status)
    this.lastStatus = status
  }

  private serviceStatusDTOToModel (status: ServiceStatusDTO): ServiceStatus {
    if (status === ServiceStatusDTO.NOT_RUNNING) {
      return ServiceStatus.NOT_RUNNING
    }
    if (status === ServiceStatusDTO.STARTING) {
      return ServiceStatus.STARTING
    }
    if (status === ServiceStatusDTO.RUNNING) {
      return ServiceStatus.RUNNING
    }
    throw new Error(`Unknown status: ${status}`)
  }
}
